package com.carrentalsystem.entity;

/**
 * Enum representing vehicle condition rating.
 */
public enum ConditionRating {
    GOOD(1),
    DAMAGED(2);

    private final int id;

    ConditionRating(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public static ConditionRating fromId(Integer id) {
        if (id == null) {
            return null;
        }
        for (ConditionRating rating : values()) {
            if (rating.id == id) {
                return rating;
            }
        }
        throw new IllegalArgumentException("Unknown condition rating id: " + id);
    }
}
