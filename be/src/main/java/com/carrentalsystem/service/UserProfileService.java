package com.carrentalsystem.service;

import com.carrentalsystem.dto.profile.DriverLicenseUpdateRequest;
import com.carrentalsystem.dto.profile.ProfileResponse;
import com.carrentalsystem.dto.profile.ProfileUpdateRequest;

public interface UserProfileService {

    ProfileResponse getProfile(String email);

    ProfileResponse updateProfile(String email, ProfileUpdateRequest request);

    ProfileResponse updateDriverLicense(String email, DriverLicenseUpdateRequest request);
}
