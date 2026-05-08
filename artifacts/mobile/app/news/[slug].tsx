import { useGetNewsArticle } from "@workspace/api-client-react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ar-SY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { data, isLoading, isError } = useGetNewsArticle(
    { slug: slug ?? "" },
    { query: { enabled: !!slug } },
  );
  const article = data?.data;

  useEffect(() => {
    if (article?.titleEn) {
      navigation.setOptions({ title: article.titleEn });
    }
  }, [article?.titleEn, navigation]);

  const styles = makeStyles(colors);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !article) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Article not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {article.coverImageUrl ? (
        <Image
          source={{ uri: article.coverImageUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.coverImage, { backgroundColor: colors.muted }]} />
      )}

      <View style={styles.content}>
        <View style={styles.metaRow}>
          <View style={[styles.sourcePill, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.sourceName, { color: colors.primary }]}>
              {article.sourceName}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            {formatDate(article.publishedAt)}
          </Text>
        </View>

        <Text style={[styles.titleAr, { color: colors.foreground }]}>
          {article.titleAr}
        </Text>

        {article.titleEn ? (
          <Text style={[styles.titleEn, { color: colors.mutedForeground }]}>
            {article.titleEn}
          </Text>
        ) : null}

        {article.tags && article.tags.length > 0 ? (
          <View style={styles.tagsRow}>
            {article.tags.slice(0, 5).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {article.aiSummaryAr || article.summaryAr ? (
          <View style={[styles.summaryBox, { backgroundColor: colors.secondary, borderLeftColor: colors.primary }]}>
            <Text style={[styles.summaryLabel, { color: colors.primary }]}>
              AI Summary
            </Text>
            <Text style={[styles.summaryText, { color: colors.foreground }]}>
              {article.aiSummaryAr ?? article.summaryAr}
            </Text>
            {article.aiSummaryEn || article.summaryEn ? (
              <Text style={[styles.summaryTextEn, { color: colors.mutedForeground }]}>
                {article.aiSummaryEn ?? article.summaryEn}
              </Text>
            ) : null}
          </View>
        ) : null}

        {article.bodyAr ? (
          <Text style={[styles.bodyText, { color: colors.foreground }]}>
            {article.bodyAr}
          </Text>
        ) : null}

        {article.bodyEn ? (
          <Text style={[styles.bodyTextEn, { color: colors.mutedForeground }]}>
            {article.bodyEn}
          </Text>
        ) : null}

        <Pressable
          style={[styles.sourceLink, { borderColor: colors.border }]}
          onPress={() => Linking.openURL(article.sourceUrl).catch(() => {})}
        >
          <Text style={[styles.sourceLinkText, { color: colors.primary }]}>
            View original source
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof import("@/hooks/useColors").useColors>) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      fontFamily: "Inter_400Regular",
      fontSize: 16,
    },
    coverImage: {
      width: "100%",
      height: 220,
    },
    content: {
      padding: 16,
      gap: 14,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sourcePill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    sourceName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
    },
    dateText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    titleAr: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      lineHeight: 34,
      textAlign: "right",
      writingDirection: "rtl",
    },
    titleEn: {
      fontFamily: "Inter_500Medium",
      fontSize: 16,
      lineHeight: 24,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    tag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    tagText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    summaryBox: {
      borderLeftWidth: 3,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: colors.radius / 2,
      gap: 6,
    },
    summaryLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      letterSpacing: 0.5,
    },
    summaryText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 22,
      textAlign: "right",
      writingDirection: "rtl",
    },
    summaryTextEn: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      lineHeight: 20,
      fontStyle: "italic",
    },
    bodyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      lineHeight: 26,
      textAlign: "right",
      writingDirection: "rtl",
    },
    bodyTextEn: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 22,
      fontStyle: "italic",
    },
    sourceLink: {
      borderWidth: 1,
      borderRadius: colors.radius,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 8,
    },
    sourceLinkText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
  });
}
