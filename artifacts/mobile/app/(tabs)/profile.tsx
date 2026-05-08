import { useGetCurrentAuthUser } from "@workspace/api-client-react";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const APP_VERSION = "1.0.0";

function InfoRow({ label, value, colors }: {
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  const styles = makeStyles(colors);
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: authData, isLoading } = useGetCurrentAuthUser();

  const user = authData?.user ?? null;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const styles = makeStyles(colors);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        {user?.profileImageUrl ? (
          <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {user?.firstName?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}

        {isLoading ? (
          <Text style={[styles.userName, { color: colors.mutedForeground }]}>Loading...</Text>
        ) : user ? (
          <>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "User"}
            </Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
              {user.email ?? ""}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              Not signed in
            </Text>
            <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
              Sign in to manage your listings
            </Text>
          </>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          APP INFO
        </Text>
        <InfoRow label="Version" value={APP_VERSION} colors={colors} />
        <InfoRow label="Platform" value={Platform.OS} colors={colors} />
        <InfoRow label="Region" value="Syria" colors={colors} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          ABOUT
        </Text>
        <InfoRow label="LivingSyria" value="Your Syria platform" colors={colors} />
      </View>

      <View style={styles.brandingRow}>
        <View style={[styles.brandingBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.brandingText, { color: colors.primaryForeground }]}>
            LivingSyria
          </Text>
        </View>
        <Text style={[styles.brandingTagline, { color: colors.mutedForeground }]}>
          اكتشف سوريا
        </Text>
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
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 28,
      gap: 8,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 4,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    avatarInitial: {
      fontFamily: "Inter_700Bold",
      fontSize: 32,
      color: "#ffffff",
    },
    userName: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
    },
    userEmail: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
    },
    section: {
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    sectionTitle: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      letterSpacing: 0.8,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 6,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    infoLabel: {
      fontFamily: "Inter_400Regular",
      fontSize: 15,
    },
    infoValue: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
    },
    brandingRow: {
      alignItems: "center",
      paddingVertical: 24,
      gap: 8,
    },
    brandingBadge: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 999,
    },
    brandingText: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    brandingTagline: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      writingDirection: "rtl",
    },
  });
}
