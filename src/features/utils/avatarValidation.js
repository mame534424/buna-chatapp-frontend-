export function validateAvatarFile(file) {
  if (!file) {
    return "Please select an image.";
  }

  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return "Only JPG and PNG images are allowed.";
  }

  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return "Image size must be 5MB or less.";
  }

  return null;
}