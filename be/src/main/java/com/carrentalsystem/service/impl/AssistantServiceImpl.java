package com.carrentalsystem.service.impl;

import com.carrentalsystem.dto.assistant.AssistantChatRequest;
import com.carrentalsystem.dto.assistant.AssistantChatResponse;
import com.carrentalsystem.dto.vehicle.VehicleResponseDTO;
import com.carrentalsystem.service.AssistantService;
import com.carrentalsystem.service.VehicleService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssistantServiceImpl implements AssistantService {

    private static final String NO_DATA_MESSAGE = "No matching data is currently available in the system.";
    private static final int FALLBACK_MAX_ITEMS = 12;

    private static final Pattern SEAT_PATTERN = Pattern.compile("\\b(\\d{1,2})\\s*(seat|seats|cho)\\b",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\b(\\d{1,2})\\b");
    private static final Pattern RANGE_PATTERN = Pattern.compile(
            "([0-9][0-9.,]*(?:trieu|tr|m|k)?[0-9.,]*)\\s*(?:->|~|to|den|-)\\s*([0-9][0-9.,]*(?:trieu|tr|m|k)?[0-9.,]*)",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern PRICE_KEYWORD_PATTERN = Pattern.compile(
            "\\b(gia|price|cost|budget|vnd|dong|muc gia|tam gia)\\b",
            Pattern.CASE_INSENSITIVE);

    private static final String SYSTEM_PROMPT = """
            You are the AI assistant for a car rental system.

            Your task is to support customers using ONLY the data provided from the database or internal data included in this conversation.

            Mandatory rules:
            1. Use only the provided input data.
            2. Do not invent, guess, or add any price, vehicle status, policy, or time if missing.
            3. If data is insufficient, reply exactly:
               "No matching data is currently available in the system."
            4. If users ask outside available data, say the system currently does not have that data.
            5. Keep responses concise, clear, and focused.
            6. If there are multiple cars, list each car with:
               - car name
               - seats
               - rental price
               - availability status
               - vehicle link (if available)
            7. Do not claim certainty when the data does not show it.
            8. Do not use outside/common knowledge beyond provided data.
            9. Do not suggest promotions, offers, or policies unless present in input.
            10. Users may ask in any language, but your output must always be in English.

            Expected response format:
            - If data exists:
              Give a short answer first, then list key details.
            - If data does not exist:
              "No matching data is currently available in the system."

            You are only the language layer. The provided data is the only source of truth.
            """;

    private final VehicleService vehicleService;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.assistant.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.assistant.openai.model:gpt-4.1-mini}")
    private String openAiModel;

    @Value("${app.assistant.openai.base-url:https://api.openai.com/v1}")
    private String openAiBaseUrl;

    @Value("${app.assistant.openai.timeout-seconds:30}")
    private long openAiTimeoutSeconds;

    @Value("${app.fe-base-url:http://localhost:5173}")
    private String feBaseUrl;

    @Override
    public AssistantChatResponse chat(AssistantChatRequest request) {
        String question = request.getQuestion() == null ? "" : request.getQuestion().trim();
        if (question.isBlank()) {
            throw new IllegalArgumentException("question is required");
        }

        Object effectiveData = resolveData(request.getData());
        Object scopedData = narrowDataByQuestion(effectiveData, question);
        if (!hasUsableData(scopedData)) {
            return AssistantChatResponse.builder().answer(NO_DATA_MESSAGE).build();
        }

        if (!isOpenAiConfigured()) {
            return AssistantChatResponse.builder().answer(buildRuleBasedAnswer(scopedData, question)).build();
        }

        try {
            String answer = callOpenAi(question, scopedData);
            if (answer == null || answer.isBlank()) {
                return AssistantChatResponse.builder().answer(buildRuleBasedAnswer(scopedData, question)).build();
            }

            String normalizedAnswer = answer.trim();
            if (looksVietnamese(normalizedAnswer)) {
                return AssistantChatResponse.builder().answer(buildRuleBasedAnswer(scopedData, question)).build();
            }
            if (dataHasVehicleLinks(scopedData) && !answerContainsVehicleLink(normalizedAnswer)) {
                return AssistantChatResponse.builder().answer(buildRuleBasedAnswer(scopedData, question)).build();
            }
            return AssistantChatResponse.builder().answer(normalizedAnswer).build();
        } catch (Exception ex) {
            log.warn("Assistant OpenAI request failed. Falling back to rule-based response: {}", ex.getMessage());
            return AssistantChatResponse.builder().answer(buildRuleBasedAnswer(scopedData, question)).build();
        }
    }

    private Object resolveData(Object requestData) {
        if (!isDataEmpty(requestData)) {
            return requestData;
        }
        return buildVehicleSnapshotFromDb();
    }

    private boolean isDataEmpty(Object data) {
        if (data == null) {
            return true;
        }
        JsonNode node = objectMapper.valueToTree(data);
        if (node == null || node.isNull()) {
            return true;
        }
        if (node.isArray()) {
            return node.size() == 0;
        }
        if (node.isObject()) {
            return node.size() == 0;
        }
        return node.asText("").isBlank();
    }

    private boolean hasUsableData(Object data) {
        if (data == null) {
            return false;
        }
        JsonNode node = objectMapper.valueToTree(data);
        if (node == null || node.isNull()) {
            return false;
        }
        if (node.isArray()) {
            return node.size() > 0;
        }
        if (node.isObject()) {
            return node.size() > 0;
        }
        return !node.asText("").isBlank();
    }

    private List<Map<String, Object>> buildVehicleSnapshotFromDb() {
        List<VehicleResponseDTO> vehicles = vehicleService.getAllVehicles();
        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> seenSignatures = new HashSet<>();

        for (VehicleResponseDTO vehicle : vehicles) {
            String vehicleName = buildVehicleName(vehicle);
            String signature = "%s|%s|%s|%s".formatted(
                    vehicleName,
                    vehicle.getSeats(),
                    vehicle.getDailyPrice(),
                    vehicle.getStatus() == null ? null : vehicle.getStatus().name());
            if (!seenSignatures.add(signature)) {
                continue;
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("vehicleId", vehicle.getId());
            item.put("vehicleName", vehicleName);
            item.put("seats", vehicle.getSeats());
            item.put("rentalPrice", vehicle.getDailyPrice());
            item.put("availabilityStatus", vehicle.getStatus() == null ? null : vehicle.getStatus().name());
            item.put("vehicleLink", buildVehicleLink(vehicle.getId()));
            result.add(item);
        }
        return result;
    }

    private String buildVehicleLink(Long vehicleId) {
        if (vehicleId == null) {
            return null;
        }
        String baseUrl = feBaseUrl == null ? "" : feBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            return baseUrl + "vehicles/" + vehicleId;
        }
        return baseUrl + "/vehicles/" + vehicleId;
    }

    private String buildVehicleName(VehicleResponseDTO vehicle) {
        List<String> parts = new ArrayList<>();
        appendIfPresent(parts, vehicle.getCategoryBrand());
        appendIfPresent(parts, vehicle.getCategoryName());
        appendIfPresent(parts, vehicle.getCategoryModel());
        if (!parts.isEmpty()) {
            return String.join(" ", parts);
        }

        appendIfPresent(parts, vehicle.getBrand());
        appendIfPresent(parts, vehicle.getName());
        appendIfPresent(parts, vehicle.getModel());
        if (!parts.isEmpty()) {
            return String.join(" ", parts);
        }

        return vehicle.getLicensePlate();
    }

    private void appendIfPresent(List<String> parts, String value) {
        if (value == null) {
            return;
        }
        String trimmed = value.trim();
        if (!trimmed.isBlank()) {
            parts.add(trimmed);
        }
    }

    private boolean isOpenAiConfigured() {
        return openAiApiKey != null && !openAiApiKey.isBlank()
                && openAiModel != null && !openAiModel.isBlank();
    }

    private String callOpenAi(String question, Object data) throws IOException, InterruptedException {
        String serializedData = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("model", openAiModel);
        payload.put("temperature", 0.1);
        payload.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", buildUserPrompt(question, serializedData))));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(buildChatCompletionUrl()))
                .timeout(Duration.ofSeconds(Math.max(openAiTimeoutSeconds, 10)))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openAiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("OpenAI API returned status " + response.statusCode());
        }
        return extractAnswerFromOpenAi(response.body());
    }

    private String buildChatCompletionUrl() {
        String baseUrl = openAiBaseUrl == null ? "" : openAiBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            return baseUrl + "chat/completions";
        }
        return baseUrl + "/chat/completions";
    }

    private String buildUserPrompt(String question, String dataJson) {
        return """
                Customer question:
                %s

                Allowed data (JSON):
                %s
                """.formatted(question, dataJson);
    }

    private String extractAnswerFromOpenAi(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode contentNode = root.path("choices").path(0).path("message").path("content");

        if (contentNode.isTextual()) {
            return contentNode.asText();
        }

        if (contentNode.isArray()) {
            StringBuilder text = new StringBuilder();
            for (JsonNode item : contentNode) {
                JsonNode value = item.get("text");
                if (value != null && !value.isNull()) {
                    text.append(value.asText(""));
                }
            }
            return text.toString();
        }

        return "";
    }

    private String buildRuleBasedAnswer(Object data, String question) {
        List<JsonNode> vehicles = normalizeVehicleList(data);
        if (vehicles.isEmpty()) {
            return NO_DATA_MESSAGE;
        }

        List<JsonNode> filteredVehicles = applyQuestionFilters(vehicles, question);
        if (filteredVehicles.isEmpty()) {
            return NO_DATA_MESSAGE;
        }

        StringBuilder result = new StringBuilder("Here are the matching cars from the system:");
        int count = 0;

        for (JsonNode vehicle : filteredVehicles) {
            if (count >= FALLBACK_MAX_ITEMS) {
                break;
            }
            count++;

            result.append("\n\nCar ").append(count).append(":");
            result.append("\n- car name: ")
                    .append(readField(vehicle, "vehicleName", "tenXe", "name", "categoryName"));
            result.append("\n- seats: ")
                    .append(readField(vehicle, "seats", "soCho"));
            result.append("\n- rental price: ")
                    .append(readPriceField(vehicle, "rentalPrice", "giaThue", "dailyPrice", "dailyRate", "price"));
            result.append("\n- availability status: ")
                    .append(readAvailability(vehicle));
            result.append("\n- vehicle link: ")
                    .append(readField(vehicle, "vehicleLink", "detailUrl", "link"));
        }

        if (count == 0) {
            return NO_DATA_MESSAGE;
        }

        int remaining = filteredVehicles.size() - count;
        if (remaining > 0) {
            result.append("\n\nThere are ").append(remaining).append(" more cars in the data.");
        }

        return result.toString();
    }

    private List<JsonNode> normalizeVehicleList(Object data) {
        List<JsonNode> result = new ArrayList<>();
        JsonNode vehicleArray = normalizeVehicleArray(data);
        if (vehicleArray == null || !vehicleArray.isArray()) {
            return result;
        }
        for (JsonNode node : vehicleArray) {
            result.add(node);
        }
        return result;
    }

    private JsonNode normalizeVehicleArray(Object data) {
        if (data == null) {
            return null;
        }

        JsonNode root = objectMapper.valueToTree(data);
        if (root == null || root.isNull()) {
            return null;
        }
        if (root.isArray()) {
            return root;
        }
        if (root.isObject()) {
            for (String key : List.of("vehicles", "data", "items", "results")) {
                JsonNode array = root.get(key);
                if (array != null && array.isArray()) {
                    return array;
                }
            }
            ArrayNode singleton = objectMapper.createArrayNode();
            singleton.add(root);
            return singleton;
        }
        return null;
    }

    private List<JsonNode> applyQuestionFilters(List<JsonNode> vehicles, String question) {
        String normalizedQuestion = normalizeForMatching(question);
        OptionalInt seatFilter = extractSeatFilter(normalizedQuestion);
        Optional<PriceRange> priceRange = extractPriceRange(normalizedQuestion);

        List<JsonNode> filtered = new ArrayList<>(vehicles);

        if (seatFilter.isPresent()) {
            int expectedSeats = seatFilter.getAsInt();
            List<JsonNode> seatFiltered = new ArrayList<>();
            for (JsonNode vehicle : filtered) {
                Integer seats = parseIntField(vehicle, "seats", "soCho");
                if (seats != null && seats == expectedSeats) {
                    seatFiltered.add(vehicle);
                }
            }
            filtered = seatFiltered;
        }

        if (priceRange.isPresent()) {
            BigDecimal min = priceRange.get().min();
            BigDecimal max = priceRange.get().max();
            List<JsonNode> priceFiltered = new ArrayList<>();
            for (JsonNode vehicle : filtered) {
                BigDecimal price = parseVehiclePrice(vehicle);
                if (price == null) {
                    continue;
                }
                if (price.compareTo(min) >= 0 && price.compareTo(max) <= 0) {
                    priceFiltered.add(vehicle);
                }
            }
            filtered = priceFiltered;
        }

        return filtered;
    }

    private OptionalInt extractSeatFilter(String normalizedQuestion) {
        if (normalizedQuestion == null || normalizedQuestion.isBlank()) {
            return OptionalInt.empty();
        }

        Matcher matcher = SEAT_PATTERN.matcher(normalizedQuestion);
        if (matcher.find()) {
            try {
                return OptionalInt.of(Integer.parseInt(matcher.group(1)));
            } catch (NumberFormatException ex) {
                return OptionalInt.empty();
            }
        }

        if (isLikelySeatQueryWithoutKeyword(normalizedQuestion)) {
            Matcher numberMatcher = NUMBER_PATTERN.matcher(normalizedQuestion);
            if (numberMatcher.find()) {
                try {
                    return OptionalInt.of(Integer.parseInt(numberMatcher.group(1)));
                } catch (NumberFormatException ex) {
                    return OptionalInt.empty();
                }
            }
        }
        return OptionalInt.empty();
    }

    private Optional<PriceRange> extractPriceRange(String normalizedQuestion) {
        if (normalizedQuestion == null || normalizedQuestion.isBlank()) {
            return Optional.empty();
        }

        Matcher matcher = RANGE_PATTERN.matcher(normalizedQuestion);
        if (!matcher.find()) {
            return Optional.empty();
        }

        String leftToken = matcher.group(1);
        String rightToken = matcher.group(2);

        boolean hasUnit = hasMoneyUnit(leftToken) || hasMoneyUnit(rightToken);
        boolean hasPriceKeyword = PRICE_KEYWORD_PATTERN.matcher(normalizedQuestion).find();
        if (!hasUnit && !hasPriceKeyword) {
            return Optional.empty();
        }

        BigDecimal left = parseMoneyToken(leftToken);
        BigDecimal right = parseMoneyToken(rightToken);
        if (left == null || right == null) {
            return Optional.empty();
        }

        if (left.compareTo(right) <= 0) {
            return Optional.of(new PriceRange(left, right));
        }
        return Optional.of(new PriceRange(right, left));
    }

    private boolean hasMoneyUnit(String token) {
        if (token == null) {
            return false;
        }
        String value = token.toLowerCase(Locale.ROOT);
        return value.contains("trieu") || value.contains("tr") || value.contains("m") || value.contains("k");
    }

    private BigDecimal parseMoneyToken(String token) {
        if (token == null) {
            return null;
        }

        String value = token.trim().toLowerCase(Locale.ROOT).replace(" ", "");
        if (value.isBlank()) {
            return null;
        }
        value = value.replace("trieu", "tr");

        if (value.contains("tr")) {
            String[] parts = value.split("tr", 2);
            BigDecimal million = parseDecimalSafe(parts[0]);
            if (million == null) {
                return null;
            }

            String remainder = parts.length > 1 ? parts[1] : "";
            if (remainder.isBlank()) {
                return million.multiply(BigDecimal.valueOf(1_000_000L));
            }

            BigDecimal fractional = parseFractionMillion(remainder);
            if (fractional == null) {
                return null;
            }

            return million.add(fractional).multiply(BigDecimal.valueOf(1_000_000L));
        }

        if (value.endsWith("m")) {
            BigDecimal base = parseDecimalSafe(value.substring(0, value.length() - 1));
            if (base == null) {
                return null;
            }
            return base.multiply(BigDecimal.valueOf(1_000_000L));
        }

        if (value.endsWith("k")) {
            BigDecimal base = parseDecimalSafe(value.substring(0, value.length() - 1));
            if (base == null) {
                return null;
            }
            return base.multiply(BigDecimal.valueOf(1_000L));
        }

        return parseDecimalSafe(value);
    }

    private BigDecimal parseFractionMillion(String remainder) {
        String normalized = remainder.trim().toLowerCase(Locale.ROOT).replace(" ", "");
        if (normalized.isBlank()) {
            return BigDecimal.ZERO;
        }

        if (normalized.endsWith("k")) {
            BigDecimal thousand = parseDecimalSafe(normalized.substring(0, normalized.length() - 1));
            if (thousand == null) {
                return null;
            }
            return thousand.multiply(BigDecimal.valueOf(1_000L)).divide(BigDecimal.valueOf(1_000_000L));
        }

        normalized = normalized.replace(',', '.');
        if (!normalized.matches("[0-9]+(\\.[0-9]+)?")) {
            return null;
        }

        if (normalized.contains(".")) {
            return parseDecimalSafe(normalized);
        }

        BigDecimal num = parseDecimalSafe(normalized);
        if (num == null) {
            return null;
        }

        int len = normalized.length();
        BigDecimal divisor = BigDecimal.TEN.pow(len);
        return num.divide(divisor);
    }

    private BigDecimal parseDecimalSafe(String input) {
        if (input == null) {
            return null;
        }

        String normalized = input.trim().replace(",", ".");
        if (normalized.isBlank()) {
            return null;
        }

        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isLikelySeatQueryWithoutKeyword(String normalizedQuestion) {
        if (normalizedQuestion == null) {
            return false;
        }

        String compact = normalizedQuestion.trim();
        if (!compact.startsWith("xe") && !compact.startsWith("car") && !compact.startsWith("vehicle")) {
            return false;
        }

        Matcher numberMatcher = NUMBER_PATTERN.matcher(compact);
        int count = 0;
        while (numberMatcher.find()) {
            count++;
        }
        return count == 1;
    }

    private String normalizeForMatching(String input) {
        if (input == null) {
            return "";
        }

        String lower = input.toLowerCase(Locale.ROOT).replace('đ', 'd');
        return Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

    private Integer parseIntField(JsonNode node, String... keys) {
        String value = readField(node, keys);
        if ("No data".equals(value)) {
            return null;
        }

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private BigDecimal parseVehiclePrice(JsonNode node) {
        String price = readPriceField(node, "rentalPrice", "giaThue", "dailyPrice", "dailyRate", "price");
        if ("No data".equals(price)) {
            return null;
        }
        return parseDecimalSafe(price);
    }

    private String readField(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value == null || value.isNull()) {
                continue;
            }
            String text = value.asText("").trim();
            if (!text.isBlank()) {
                return text;
            }
        }
        return "No data";
    }

    private String readPriceField(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value == null || value.isNull()) {
                continue;
            }

            if (value.isNumber()) {
                BigDecimal decimal = value.decimalValue();
                return decimal.stripTrailingZeros().toPlainString();
            }

            String text = value.asText("").trim();
            if (text.isBlank()) {
                continue;
            }
            try {
                BigDecimal decimal = new BigDecimal(text);
                return decimal.stripTrailingZeros().toPlainString();
            } catch (NumberFormatException ex) {
                return text;
            }
        }
        return "No data";
    }

    private String readAvailability(JsonNode node) {
        JsonNode value = firstOf(node, "availabilityStatus", "trangThaiConXe", "available", "status");
        if (value == null || value.isNull()) {
            return "No data";
        }

        if (value.isBoolean()) {
            return value.asBoolean() ? "Available" : "Unavailable";
        }

        String raw = value.asText("").trim();
        if (raw.isBlank()) {
            return "No data";
        }

        String normalized = raw.toUpperCase(Locale.ROOT);
        if ("AVAILABLE".equals(normalized)) {
            return "Available";
        }
        if ("INACTIVE".equals(normalized) || "MAINTENANCE".equals(normalized)
                || "UNAVAILABLE".equals(normalized)) {
            return "Unavailable";
        }
        return raw;
    }

    private JsonNode firstOf(JsonNode node, String... keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value != null && !value.isNull()) {
                return value;
            }
        }
        return null;
    }

    private boolean looksVietnamese(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }

        String normalized = normalizeForMatching(text);
        return normalized.contains("du lieu")
                || normalized.contains("he thong")
                || normalized.contains("ten xe")
                || normalized.contains("so cho")
                || normalized.contains("gia thue")
                || normalized.contains("con xe")
                || normalized.contains("khong co du lieu")
                || normalized.contains("hien chua co");
    }

    private boolean dataHasVehicleLinks(Object data) {
        JsonNode vehicleArray = normalizeVehicleArray(data);
        if (vehicleArray == null || !vehicleArray.isArray()) {
            return false;
        }
        for (JsonNode vehicle : vehicleArray) {
            String link = readField(vehicle, "vehicleLink", "detailUrl", "link");
            if (!"No data".equals(link)) {
                return true;
            }
        }
        return false;
    }

    private boolean answerContainsVehicleLink(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        return text.contains("/vehicles/") || text.matches("(?is).*https?://\\S+.*");
    }

    private Object narrowDataByQuestion(Object data, String question) {
        List<JsonNode> vehicles = normalizeVehicleList(data);
        if (vehicles.isEmpty()) {
            return data;
        }

        List<JsonNode> filtered = applyQuestionFilters(vehicles, question);
        if (filtered.isEmpty()) {
            return filtered;
        }
        if (filtered.size() == vehicles.size()) {
            return data;
        }
        return filtered;
    }

    private record PriceRange(BigDecimal min, BigDecimal max) {
    }
}

