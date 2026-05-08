import { useGetListing } from "@workspace/api-client-react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatPrice(
  isFree: boolean,
  priceCents: number | null | undefined,
  currency: string,
  isNegotiable: boolean,
): string {
  if (isFree) return "Free";
  if (priceCents == null) return "Contact seller";
  const amount = (priceCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${amount} ${currency}${isNegotiable ? " (negotiable)" : ""}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ListingDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [imageIndex, setImageIndex] = useState(0);

  const { data, isLoading, isError } = useGetListing(
    { slug: slug ?? "" },
    { query: { enabled: !!slug } },
  );
  const listing = data?.data;

  useEffect(() => {
    if (listing?.titleEn ?? listing?.titleAr) {
      navigation.setOptions({ title: listing.titleEn ?? listing.titleAr });
    }
  }, [listing?.titleEn, listing?.titleAr, navigation]);

  const styles = makeStyles(colors);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Listing not found
        </Text>
      </View>
    );
  }

  const images =
    (listing as typeof listing & { images?: { objectPath: string }[] }).images ?? [];
  const displayImage =
    images[imageIndex]?.objectPath
      ? images[imageIndex].objectPath
      : listing.primaryImageUrl;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {displayImage ? (
        <Image
          source={{ uri: displayImage }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.mainImage, { backgroundColor: colors.muted }]} />
      )}

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        >
          {images.map((img, idx) => (
            <Pressable key={img.objectPath} onPress={() => setImageIndex(idx)}>
              <Image
                source={{ uri: img.objectPath }}
                style={[
                  styles.thumbnail,
                  { borderColor: idx === imageIndex ? colors.primary : colors.border },
                ]}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(listing.isFree, listing.priceCents, listing.currency, listing.isNegotiable)}
          </Text>
          {listing.status === "PENDING_REVIEW" && (
            <View style={[styles.statusBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.statusText, { color: colors.accentForeground }]}>
                Under Review
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.titleAr, { color: colors.foreground }]}>
          {listing.titleAr}
        </Text>

        {listing.titleEn ? (
          <Text style={[styles.titleEn, { color: colors.mutedForeground }]}>
            {listing.titleEn}
          </Text>
        ) : null}

        <View style={[styles.metaGrid, { backgroundColor: colors.card }]}>
          <MetaItem label="City" value={listing.city} colors={colors} />
          {listing.district ? (
            <MetaItem label="District" value={listing.district} colors={colors} />
          ) : null}
          <MetaItem
            label="Category"
            value={
              (listing as typeof listing & { category?: { nameEn?: string | null; nameAr: string } })
                .category?.nameEn ??
              (listing as typeof listing & { category?: { nameAr: string } }).category?.nameAr ??
              listing.categoryId
            }
            colors={colors}
          />
          <MetaItem label="Views" value={String(listing.viewCount)} colors={colors} />
          {listing.createdAt ? (
            <MetaItem label="Posted" value={formatDate(listing.createdAt)} colors={colors} />
          ) : null}
        </View>

        {listing.descriptionAr ? (
          <View style={styles.descSection}>
            <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>Description</Text>
            <Text style={[styles.descAr, { color: colors.foreground }]}>
              {listing.descriptionAr}
            </Text>
            {listing.descriptionEn ? (
              <Text style={[styles.descEn, { color: colors.mutedForeground }]}>
                {listing.descriptionEn}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function MetaItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const styles = makeStyles(colors);
  return (
    <View style={[styles.metaItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.foreground }]}>{value}</Text>
    </View>
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
    mainImage: {
      width: "100%",
      height: 280,
    },
    thumbnail: {
      width: 64,
      height: 64,
      borderRadius: 8,
      borderWidth: 2,
    },
    content: {
      padding: 16,
      gap: 14,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    price: {
      fontFamily: "Inter_700Bold",
      fontSize: 24,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusText: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    titleAr: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      lineHeight: 30,
      textAlign: "right",
      writingDirection: "rtl",
    },
    titleEn: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      lineHeight: 22,
    },
    metaGrid: {
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    metaItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    metaLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    metaValue: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
    },
    descSection: {
      gap: 6,
    },
    descLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      letterSpacing: 0.5,
    },
    descAr: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      lineHeight: 26,
      textAlign: "right",
      writingDirection: "rtl",
    },
    descEn: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      lineHeight: 22,
      fontStyle: "italic",
    },
  });
}
