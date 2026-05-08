import { useListNews } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ar-SY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetchingNextPage } = useListNews(
    { limit: 20, page },
    { query: { enabled: true } },
  );

  const articles = data?.data ?? [];
  const totalPages = data?.meta?.pages ?? 1;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const styles = makeStyles(colors);

  if (isLoading && articles.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError && articles.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Failed to load news
        </Text>
        <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
          <Text style={[styles.retryBtnText, { color: colors.primaryForeground }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 8,
        paddingHorizontal: 16,
        paddingBottom: bottomPad,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!!articles.length}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          Syria News
        </Text>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
            No articles yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Check back soon for the latest Syria news
          </Text>
        </View>
      }
      ListFooterComponent={
        page < totalPages ? (
          <Pressable
            style={[styles.loadMore, { borderColor: colors.border }]}
            onPress={() => setPage((p) => p + 1)}
          >
            {isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                Load more
              </Text>
            )}
          </Pressable>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable
          style={[styles.articleCard, { backgroundColor: colors.card }]}
          onPress={() => router.push(`/news/${item.slug}`)}
        >
          {item.coverImageUrl ? (
            <Image
              source={{ uri: item.coverImageUrl }}
              style={styles.articleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.articleImage, { backgroundColor: colors.muted }]} />
          )}
          <View style={styles.articleBody}>
            <Text
              style={[styles.articleTitle, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {item.titleAr}
            </Text>
            {item.titleEn ? (
              <Text
                style={[styles.articleTitleEn, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {item.titleEn}
              </Text>
            ) : null}
            {item.summaryAr || item.aiSummaryAr ? (
              <Text
                style={[styles.articleSummary, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {item.summaryAr ?? item.aiSummaryAr}
              </Text>
            ) : null}
            <View style={styles.articleMeta}>
              <View style={[styles.sourcePill, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.sourceName, { color: colors.primary }]}>
                  {item.sourceName}
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                {formatDate(item.publishedAt)}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    screenTitle: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
      marginBottom: 4,
    },
    errorText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
    },
    retryBtn: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: colors.radius,
    },
    retryBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      gap: 8,
    },
    emptyTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
    },
    emptySubtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      textAlign: "center",
    },
    articleCard: {
      borderRadius: colors.radius,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    articleImage: {
      width: "100%",
      height: 180,
    },
    articleBody: {
      padding: 14,
      gap: 6,
    },
    articleTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      lineHeight: 24,
      textAlign: "right",
      writingDirection: "rtl",
    },
    articleTitleEn: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 18,
    },
    articleSummary: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "right",
      writingDirection: "rtl",
    },
    articleMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 4,
    },
    sourcePill: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 999,
    },
    sourceName: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    dateText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    loadMore: {
      marginTop: 8,
      paddingVertical: 14,
      borderWidth: 1,
      borderRadius: colors.radius,
      alignItems: "center",
    },
    loadMoreText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
  });
}
