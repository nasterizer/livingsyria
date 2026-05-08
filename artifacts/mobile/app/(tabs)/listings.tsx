import { useListListings, useListCategories } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatPrice(
  isFree: boolean,
  priceCents: number | null | undefined,
  currency: string,
): string {
  if (isFree) return "Free";
  if (priceCents == null) return "Contact";
  const amount = (priceCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${amount} ${currency}`;
}

export default function ListingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const categoriesQuery = useListCategories();
  const categories = categoriesQuery.data?.data ?? [];

  const listingsQuery = useListListings(
    { limit: 20, ...(search ? { q: search } : {}), ...(activeCategory ? { category: activeCategory } : {}) },
    { query: { enabled: true } },
  );
  const listings = listingsQuery.data?.data ?? [];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await listingsQuery.refetch();
    setRefreshing(false);
  }, [listingsQuery]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Listings</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search listings..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          >
            <Pressable
              style={[
                styles.chip,
                {
                  backgroundColor: !activeCategory ? colors.primary : colors.secondary,
                  borderColor: !activeCategory ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(undefined)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: !activeCategory ? colors.primaryForeground : colors.foreground },
                ]}
              >
                All
              </Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activeCategory === cat.slug ? colors.primary : colors.secondary,
                    borderColor: activeCategory === cat.slug ? colors.primary : colors.border,
                  },
                ]}
                onPress={() =>
                  setActiveCategory(activeCategory === cat.slug ? undefined : cat.slug)
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        activeCategory === cat.slug
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {cat.nameEn ?? cat.nameAr}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {listingsQuery.isLoading && listings.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: bottomPad, gap: 10 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!listings.length}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
                {search ? "No results found" : "No listings yet"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                {search ? "Try a different search term" : "Be the first to post a listing"}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.listingCard, { backgroundColor: colors.card }]}
              onPress={() => router.push(`/listings/${item.slug}`)}
            >
              {item.primaryImageUrl ? (
                <Image
                  source={{ uri: item.primaryImageUrl }}
                  style={styles.listingImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.listingImage, { backgroundColor: colors.muted }]} />
              )}
              <View style={styles.listingBody}>
                <Text
                  style={[styles.listingTitle, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {item.titleAr}
                </Text>
                <Text style={[styles.listingPrice, { color: colors.primary }]}>
                  {formatPrice(item.isFree, item.priceCents, item.currency)}
                </Text>
                <Text style={[styles.listingCity, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.city}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    topBar: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 10,
    },
    screenTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
    },
    searchBar: {
      borderRadius: colors.radius / 1.5,
      borderWidth: 1,
      paddingHorizontal: 12,
      height: 42,
      justifyContent: "center",
    },
    searchInput: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      flex: 1,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    chipText: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 32,
      gap: 8,
    },
    emptyTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      textAlign: "center",
    },
    emptySubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
    },
    listingCard: {
      flex: 1,
      borderRadius: colors.radius,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
    },
    listingImage: {
      width: "100%",
      height: 120,
    },
    listingBody: {
      padding: 10,
      gap: 4,
    },
    listingTitle: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      lineHeight: 18,
      textAlign: "right",
      writingDirection: "rtl",
    },
    listingPrice: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
    },
    listingCity: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
    },
  });
}
