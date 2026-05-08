import { useListNews, useListListings } from "@workspace/api-client-react";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

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

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const newsQuery = useListNews({ limit: 6 }, { query: { enabled: true } });
  const listingsQuery = useListListings({ limit: 6 }, { query: { enabled: true } });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([newsQuery.refetch(), listingsQuery.refetch()]);
    setRefreshing(false);
  }, [newsQuery, listingsQuery]);

  const topPad =
    Platform.OS === "web" ? 67 : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 84 : insets.bottom + 60;

  const styles = makeStyles(colors);

  const newsArticles = newsQuery.data?.data ?? [];
  const listings = listingsQuery.data?.data ?? [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={styles.headerSub}>اكتشف سوريا</Text>
        <Text style={styles.headerTitle}>LivingSyria</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Latest News</Text>
          <Pressable onPress={() => router.push("/(tabs)/news")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </Pressable>
        </View>

        {newsQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : newsArticles.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No articles yet
          </Text>
        ) : (
          <FlatList
            horizontal
            data={newsArticles}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            scrollEnabled={!!newsArticles.length}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.newsCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/news/${item.slug}`)}
              >
                {item.coverImageUrl ? (
                  <Image
                    source={{ uri: item.coverImageUrl }}
                    style={styles.newsCardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.newsCardImage, { backgroundColor: colors.muted }]}
                  />
                )}
                <View style={styles.newsCardBody}>
                  <Text
                    style={[styles.newsCardTitle, { color: colors.foreground }]}
                    numberOfLines={2}
                  >
                    {item.titleAr}
                  </Text>
                  <View style={styles.newsCardMeta}>
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {item.sourceName}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                      {formatRelativeDate(item.publishedAt)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Listings
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/listings")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </Pressable>
        </View>

        {listingsQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
        ) : listings.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No listings yet
          </Text>
        ) : (
          <View style={styles.listingsGrid}>
            {listings.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.listingCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/listings/${item.slug}`)}
              >
                {item.primaryImageUrl ? (
                  <Image
                    source={{ uri: item.primaryImageUrl }}
                    style={styles.listingCardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.listingCardImage,
                      { backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" },
                    ]}
                  />
                )}
                <View style={styles.listingCardBody}>
                  <Text
                    style={[styles.listingCardTitle, { color: colors.foreground }]}
                    numberOfLines={2}
                  >
                    {item.titleAr}
                  </Text>
                  <Text style={[styles.listingPrice, { color: colors.primary }]}>
                    {formatPrice(item.isFree, item.priceCents, item.currency)}
                  </Text>
                  <Text style={[styles.listingCity, { color: colors.mutedForeground }]}>
                    {item.city}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 24,
      gap: 2,
    },
    headerSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: "rgba(255,255,255,0.7)",
      textAlign: "right",
      writingDirection: "rtl",
    },
    headerTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: "#ffffff",
      letterSpacing: -0.5,
    },
    section: {
      marginTop: 24,
    },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
    },
    seeAll: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
    emptyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
      marginVertical: 24,
    },
    newsCard: {
      width: 240,
      borderRadius: colors.radius,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    newsCardImage: {
      width: "100%",
      height: 130,
    },
    newsCardBody: {
      padding: 12,
      gap: 8,
    },
    newsCardTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      lineHeight: 20,
      textAlign: "right",
      writingDirection: "rtl",
    },
    newsCardMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    metaText: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
    },
    listingsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      gap: 10,
    },
    listingCard: {
      width: "47%",
      borderRadius: colors.radius,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 1,
    },
    listingCardImage: {
      width: "100%",
      height: 110,
    },
    listingCardBody: {
      padding: 10,
      gap: 4,
    },
    listingCardTitle: {
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
