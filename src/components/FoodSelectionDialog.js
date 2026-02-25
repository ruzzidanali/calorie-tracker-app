import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const FoodSelectionDialog = ({ 
  visible, 
  onClose, 
  foods, 
  onSelectFood,
  loading,
  onSearch,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Search Food Database</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food... (e.g., chicken, apple)"
              value={searchQuery}
              onChangeText={onSearchChange}
              onSubmitEditing={onSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Searching food database...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView}>
              {foods.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={48} color={COLORS.textLight} />
                  {searchQuery.length === 0 ? (
                    <>
                      <Text style={styles.emptyText}>Start typing to search</Text>
                      <Text style={styles.emptySubtext}>Try: "chicken", "apple", "rice"</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.emptyText}>No foods found</Text>
                      <Text style={styles.emptySubtext}>Try a different search term</Text>
                    </>
                  )}
                </View>
              ) : (
                <>
                  <Text style={styles.resultCount}>{foods.length} results found</Text>
                  {foods.map((food, index) => (
                    <TouchableOpacity
                      key={`food-${index}-${food.name}`}
                      style={styles.foodItem}
                      onPress={() => onSelectFood(food)}
                    >
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        {food.brand && (
                          <Text style={styles.foodBrand}>{food.brand}</Text>
                        )}
                        <Text style={styles.foodNutrition}>
                          {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                        </Text>
                        <Text style={styles.foodServing}>Per {food.serving}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <TouchableOpacity
                style={styles.manualButton}
                onPress={onClose}
              >
                <Ionicons name="pencil" size={20} color={COLORS.primary} />
                <Text style={styles.manualText}>Add Manually Instead</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  scrollView: {
    paddingHorizontal: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  resultCount: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  foodNutrition: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginBottom: 2,
  },
  foodServing: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  manualText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FoodSelectionDialog;