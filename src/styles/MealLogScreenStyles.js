import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../constants/theme";

export const styles = StyleSheet.create({
  // Camera section
  cameraButton: {
    backgroundColor: COLORS.primary,
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "600",
    marginTop: 8,
  },
  orText: {
    textAlign: "center",
    color: COLORS.textLight,
    marginVertical: 16,
    fontSize: SIZES.medium,
    fontWeight: "600",
  },

  // Macros input
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  macroInput: {
    flex: 1,
    marginHorizontal: 4,
  },

  // Quick add buttons
  quickAddContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAddButton: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAddText: {
    color: COLORS.text,
    fontSize: SIZES.medium,
  },
  imagePreview: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
  },
  cameraButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  recognizingContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  recognizingText: {
    marginTop: 12,
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: "600",
  },
  tipsCard: {
    backgroundColor: "#FFF9E6",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FFE066",
  },
  tipsTitle: {
    fontSize: SIZES.medium,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    lineHeight: 20,
  },
});
