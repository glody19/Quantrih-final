with open("firestore.rules", "r") as f:
    content = f.read()

old_user_validation = """             (data.keys().hasAny(['avatarUrl']) ? data.avatarUrl is string && data.avatarUrl.size() <= 500 : true) &&"""
new_user_validation = """             (data.keys().hasAny(['avatarUrl']) ? data.avatarUrl is string && data.avatarUrl.size() <= 500 : true) &&
             (data.keys().hasAny(['photoURL']) ? data.photoURL is string || data.photoURL == null : true) &&
             (data.keys().hasAny(['accountType']) ? data.accountType is string && data.accountType.size() <= 50 : true) &&"""
content = content.replace(old_user_validation, new_user_validation)

old_update = """incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'firstName', 'lastName', 'email', 'nationality', 'residenceCountry', 'phone', 'phoneCountryCode', 'phoneCountryFlag', 'avatarUrl', 'username', 'company', 'firmType', 'updatedAt', 'lastLoginAt', 'status', 'emailVerified', 'canChangePassword', 'twoFactorEnabled', 'twoFactorMethod', 'passwordLastChangedAt', 'securityNotificationsEnabled'])"""
new_update = """incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'firstName', 'lastName', 'email', 'nationality', 'residenceCountry', 'phone', 'phoneCountryCode', 'phoneCountryFlag', 'avatarUrl', 'photoURL', 'accountType', 'username', 'company', 'firmType', 'updatedAt', 'lastLoginAt', 'status', 'emailVerified', 'canChangePassword', 'twoFactorEnabled', 'twoFactorMethod', 'passwordLastChangedAt', 'securityNotificationsEnabled'])"""
content = content.replace(old_update, new_update)

with open("firestore.rules", "w") as f:
    f.write(content)
print("Updated firestore.rules")
