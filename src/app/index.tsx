import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { LiveMap } from "../components/live-map";

// ==========================================
// TYPESCRIPT DEFINITIONS
// ==========================================
type TripDetails = {
  destination: string;
  budget: number;
};

type UserProfile = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  useCurrentLocation: boolean;
};

type RideHistoryItem = {
  id: string;
  rideName: string;
  icon: string;
  route: string;
  price: number;
  status: "Completed" | "Cancelled";
};

type Ride = {
  name: string;
  icon: string;
  price: number;
  time: string;
  safetyScore: string;
};

type LoginScreenProps = {
  onLogin: (profile: UserProfile) => void;
};

type DashboardScreenProps = {
  profile: UserProfile;
  rideHistory: RideHistoryItem[];
  onStartTrip: () => void;
  onLogout: () => void;
};

type TripFormScreenProps = {
  onSubmitForm: (details: TripDetails) => void;
  onBack: () => void;
};

type HomeScreenProps = {
  onLogout: () => void;
  tripDetails: TripDetails;
  onLockRide: (ride: Ride, pickup: string) => void;
  onBack: () => void;
};

type LockRouteScreenProps = {
  ride: Ride;
  pickup: string;
  destination: string;
  onStartJourney: () => void;
  onCancel: () => void;
  onBack: () => void;
};

type SafetyScreenProps = {
  ride: Ride;
  destination: string;
  onEndJourney: () => void;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

// ==========================================
// MOCK DATA & THEME
// ==========================================
const rides: Ride[] = [
  { name: "Bike (Verified)", icon: "🛵", price: 95, time: "15–20 min", safetyScore: "98%" },
  { name: "Auto (YatraGuard Partner)", icon: "🛺", price: 130, time: "18–25 min", safetyScore: "99%" },
  { name: "Cab (Premium Safe)", icon: "🚕", price: 180, time: "20–30 min", safetyScore: "100%" },
];

const THEME = {
  primary: "#2563EB", 
  primaryDark: "#1E40AF", 
  secondary: "#EFF6FF", 
  background: "#F3F4F6", 
  card: "#FFFFFF",
  textMain: "#111827",
  textMuted: "#6B7280",
  danger: "#DC2626",
  success: "#059669",
};

// ==========================================
// STYLES (MOVED TO TOP TO PREVENT TS ERRORS)
// ==========================================

const sharedStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.background },
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  shell: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
  },
  scrollContainer: { paddingHorizontal: 0, paddingTop: 30, paddingBottom: 40 },
  headerLeft: { marginBottom: 28 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontSize: 34, fontWeight: "800", color: THEME.textMain, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: THEME.textMuted, marginTop: 6, fontWeight: "500" },
  card: { backgroundColor: THEME.card, borderRadius: 24, padding: 24, elevation: 4, shadowColor: THEME.primaryDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  heading: { fontSize: 20, fontWeight: "700", color: THEME.textMain, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", color: THEME.textMuted, marginBottom: 8, marginTop: 4, textTransform: "uppercase" },
  input: { height: 54, borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 20, backgroundColor: "#F9FAFB", color: THEME.textMain },
  primaryButton: { height: 56, borderRadius: 14, backgroundColor: THEME.primary, alignItems: "center", justifyContent: "center", marginTop: 10, elevation: 2 },
  primaryButtonText: { color: THEME.card, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  secondaryButton: { height: 56, borderRadius: 14, backgroundColor: THEME.secondary, alignItems: "center", justifyContent: "center", marginTop: 15 },
  secondaryButtonText: { color: THEME.primaryDark, fontSize: 16, fontWeight: "700" },
  backButton: { alignSelf: "flex-start", minWidth: 92, height: 42, paddingHorizontal: 14, borderRadius: 12, backgroundColor: THEME.card, alignItems: "center", justifyContent: "center", elevation: 2, marginBottom: 16 },
  backButtonText: { color: THEME.primaryDark, fontSize: 14, fontWeight: "800" },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

const popupStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(17, 24, 39, 0.45)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "100%", maxWidth: 420, backgroundColor: THEME.card, borderRadius: 20, padding: 24, elevation: 8, shadowColor: THEME.textMain, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 14 },
  title: { fontSize: 20, fontWeight: "800", color: THEME.textMain, marginBottom: 10 },
  message: { fontSize: 15, lineHeight: 22, color: THEME.textMuted, marginBottom: 20 },
  button: { height: 48, borderRadius: 12, backgroundColor: THEME.primary, alignItems: "center", justifyContent: "center" },
  buttonText: { color: THEME.card, fontSize: 15, fontWeight: "800" },
});

type PopupMessage = {
  title: string;
  message: string;
};

function ValidationPopup({ popup, onClose }: { popup: PopupMessage | null; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={popup !== null} onRequestClose={onClose}>
      <View style={popupStyles.overlay}>
        <View style={popupStyles.card}>
          <Text style={popupStyles.title}>{popup?.title}</Text>
          <Text style={popupStyles.message}>{popup?.message}</Text>
          <Pressable style={popupStyles.button} onPress={onClose}>
            <Text style={popupStyles.buttonText}>Okay</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const loginStyles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 28 },
  logo: { fontSize: 44, fontWeight: "900", color: THEME.textMain, letterSpacing: -1 },
  tagline: { fontSize: 15, color: THEME.textMuted, marginTop: 5, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "800", color: THEME.textMain },
  subtitle: { fontSize: 14, color: THEME.textMuted, marginTop: 6, marginBottom: 25 },
  toggleRow: { flexDirection: "row", backgroundColor: "#E0ECFF", borderRadius: 14, padding: 6, marginBottom: 20 },
  toggleButton: { flex: 1, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleButtonActive: { backgroundColor: THEME.primary },
  toggleButtonText: { fontSize: 13, fontWeight: "700", color: THEME.textMain },
  toggleButtonTextActive: { color: THEME.card },
  infoBanner: { backgroundColor: "#EEF7FF", borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: "#CFE3FF" },
  infoBannerText: { fontSize: 12, color: THEME.primaryDark, fontWeight: "600" },
  sectionText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, color: THEME.textMuted, textTransform: "uppercase", marginBottom: 10 },
  locationRow: { flexDirection: "row", marginBottom: 14 },
  locationOption: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1.5, borderColor: "#DDE7F5", alignItems: "center", justifyContent: "center", marginRight: 8, backgroundColor: "#F9FBFF" },
  locationOptionSelected: { borderColor: THEME.primary, backgroundColor: THEME.secondary },
  locationOptionText: { fontSize: 12, fontWeight: "700", color: THEME.textMain },
  locationHint: { fontSize: 12, color: THEME.textMuted, marginBottom: 10 },
  helpText: { fontSize: 12, color: THEME.textMuted, marginTop: 10, marginBottom: 12 },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -10 },
  forgotPasswordText: { color: THEME.primary, fontSize: 14, fontWeight: "600" },
  footerText: { textAlign: "center", fontSize: 13, color: THEME.textMuted, marginTop: 18 },
  footerActionText: { color: THEME.primary, fontWeight: "700" },
});

const tripStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#EEF5FF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8E7FF",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    color: THEME.textMain,
    fontWeight: "800",
    marginTop: 5,
  },
  summaryValueAccent: {
    color: THEME.primary,
  },
});

const homeStyles = StyleSheet.create({
  settingsButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: THEME.card, alignItems: "center", justifyContent: "center", elevation: 2 },
  settingsIcon: { fontSize: 22 },
  resultsSection: { marginTop: 25 },
  bestCard: { backgroundColor: THEME.secondary, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: THEME.primary, elevation: 2 },
  bestBadge: { alignSelf: "flex-start", backgroundColor: THEME.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginBottom: 12 },
  bestBadgeText: { color: THEME.card, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  fareCard: { backgroundColor: THEME.card, borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  fareRow: { flexDirection: "row", alignItems: "center" },
  fareIcon: { fontSize: 36, width: 55 },
  fareDetails: { flex: 1 },
  fareName: { fontSize: 17, fontWeight: "800", color: THEME.textMain },
  fareTime: { fontSize: 12, color: THEME.textMuted, marginTop: 4, fontWeight: "600" },
  priceContainer: { alignItems: "flex-end" },
  farePrice: { fontSize: 20, fontWeight: "900", color: THEME.primaryDark },
  selectText: { fontSize: 13, fontWeight: "700", color: THEME.primary, marginTop: 3 },
});

const dashboardStyles = StyleSheet.create({
  profileCard: { backgroundColor: THEME.primary, borderRadius: 22, padding: 22, marginBottom: 16, elevation: 4 },
  profileEyebrow: { color: "#BFDBFE", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  profileName: { color: THEME.card, fontSize: 26, fontWeight: "900", marginTop: 6 },
  profileContact: { color: "#DBEAFE", fontSize: 13, marginTop: 6 },
  profileLocation: { color: "#DBEAFE", fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  actionButton: { flex: 1, minHeight: 58, borderRadius: 14, paddingHorizontal: 12, backgroundColor: THEME.card, alignItems: "center", justifyContent: "center", elevation: 2 },
  actionPrimary: { flex: 1.35, minHeight: 76, borderWidth: 2, borderColor: THEME.primary, backgroundColor: THEME.secondary },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionText: { color: THEME.primaryDark, fontSize: 12, fontWeight: "800", textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: THEME.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  statValue: { color: THEME.primaryDark, fontSize: 22, fontWeight: "900" },
  statLabel: { color: THEME.textMuted, fontSize: 11, fontWeight: "700", marginTop: 4, textTransform: "uppercase" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: THEME.textMain, fontSize: 20, fontWeight: "800" },
  sectionHint: { color: THEME.textMuted, fontSize: 12 },
  historyCard: { backgroundColor: THEME.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center" },
  historyIcon: { fontSize: 28, width: 44 },
  historyDetails: { flex: 1 },
  historyRide: { color: THEME.textMain, fontSize: 15, fontWeight: "800" },
  historyRoute: { color: THEME.textMuted, fontSize: 12, marginTop: 4 },
  historyPrice: { color: THEME.primaryDark, fontSize: 15, fontWeight: "900" },
  historyStatus: { color: THEME.success, fontSize: 11, fontWeight: "800", marginTop: 3, textAlign: "right" },
  emptyHistory: { backgroundColor: THEME.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  emptyHistoryText: { color: THEME.textMuted, fontSize: 14, lineHeight: 20 },
  safetyCard: { backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16, marginTop: 24, borderWidth: 1, borderColor: "#A7F3D0" },
  safetyTitle: { color: "#065F46", fontSize: 15, fontWeight: "800" },
  safetyText: { color: "#047857", fontSize: 13, marginTop: 6, lineHeight: 19 },
});

const lockStyles = StyleSheet.create({
  routeInfo: { backgroundColor: THEME.secondary, padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#DDB6FE", borderStyle: 'dashed' },
  routeText: { fontSize: 15, color: THEME.textMain, marginBottom: 5 },
  rideInfo: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.background, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  rideDetails: { flex: 1 },
  etaLabel: { fontSize: 11, color: THEME.textMuted, fontWeight: "700", marginTop: 8, textTransform: "uppercase" },
  etaValue: { fontSize: 15, color: THEME.success, fontWeight: "800", marginTop: 2 },
});

const safetyStyles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "stretch", gap: 12, marginBottom: 20 },
  statusCard: { backgroundColor: THEME.card, borderRadius: 18, padding: 20, marginBottom: 30, borderWidth: 2, borderColor: THEME.primary, elevation: 4 },
  statusTitle: { fontSize: 17, fontWeight: "800", color: THEME.primaryDark, marginBottom: 12 },
  statusText: { fontSize: 14, color: THEME.textMain, marginTop: 6, fontWeight: "500" },
  mapSection: { marginBottom: 24 },
  distanceText: { fontSize: 16, fontWeight: "800", color: THEME.primaryDark, marginBottom: 10 },
  map: { borderRadius: 18 },
  mapMessage: { color: THEME.textMuted, textAlign: "center", marginBottom: 24 },
  sosContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginBottom: 30, padding: 12, backgroundColor: "#FFF7F7", borderRadius: 18, borderWidth: 1, borderColor: "#FECACA" },
  sosRipple: { width: 156, height: 156, borderRadius: 78, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }, 
  sosButton: { width: 132, height: 132, borderRadius: 66, backgroundColor: THEME.danger, alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: THEME.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  sosText: { color: THEME.card, fontSize: 36, fontWeight: "900", letterSpacing: 1 },
  sosHelpText: { color: THEME.danger, fontSize: 9, marginTop: 10, fontWeight: "800", letterSpacing: 0.5, textAlign: "center" },
});

// ==========================================
// 1. LOGIN SCREEN
// ==========================================
function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Delhi");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [popup, setPopup] = useState<PopupMessage | null>(null);

  const handleLogin = () => {
    if (mode === "signup") {
      const missingSignupDetails = [fullName, phone, email, password].filter((value) => !value.trim()).length;
      if (missingSignupDetails > 0) {
        setPopup({
          title: missingSignupDetails === 4 ? "Traveler details required" : "Traveler details incomplete",
          message: missingSignupDetails === 4
            ? "Please fill in the details first before continuing."
            : "Please fill in all the details first before continuing.",
        });
        return;
      }
      Alert.alert("Profile Ready", `Welcome ${fullName}! Your trip planner profile is ready.`);
    } else {
      const missingSignInDetails = [email, password].filter((value) => !value.trim()).length;
      if (missingSignInDetails > 0) {
        setPopup({
          title: missingSignInDetails === 2 ? "Sign-in details required" : "Sign-in details incomplete",
          message: missingSignInDetails === 2
            ? "Please fill in the details first before continuing."
            : "Please fill in all the details first before continuing.",
        });
        return;
      }
    }
    onLogin({
      fullName: fullName.trim() || "Traveler",
      phone: phone.trim() || "Not added",
      email: email.trim(),
      city: useCurrentLocation ? "Current location" : city.trim(),
      useCurrentLocation,
    });
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address to reset your password.");
      return;
    }
    Alert.alert("Reset Link Sent", `A password recovery link has been sent to ${email}.`);
  };

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.shell}>
        <View style={sharedStyles.card}>
          <Text style={loginStyles.title}>YatraGuard 👋</Text>
          <Text style={loginStyles.subtitle}>
            {mode === "signin"
              ? "Secure access to your travel dashboard"
              : "Build your trusted trip profile before booking a ride"}
          </Text>

        <View style={loginStyles.toggleRow}>
          <Pressable
            style={({ pressed }) => [loginStyles.toggleButton, mode === "signin" ? loginStyles.toggleButtonActive : null, pressed ? sharedStyles.buttonPressed : null]}
            onPress={() => setMode("signin")}
          >
            <Text style={[loginStyles.toggleButtonText, mode === "signin" ? loginStyles.toggleButtonTextActive : null]}>Sign In</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [loginStyles.toggleButton, mode === "signup" ? loginStyles.toggleButtonActive : null, pressed ? sharedStyles.buttonPressed : null]}
            onPress={() => setMode("signup")}
          >
            <Text style={[loginStyles.toggleButtonText, mode === "signup" ? loginStyles.toggleButtonTextActive : null]}>New Account</Text>
          </Pressable>
        </View>

        <View style={loginStyles.infoBanner}>
          <Text style={loginStyles.infoBannerText}>
            {mode === "signin"
              ? "Already a traveler? Sign in to continue your safe route plan."
              : "New to YatraGuard? Set up your profile and let us plan your safest ride."}
          </Text>
        </View>

        {mode === "signup" && (
          <>
            <Text style={sharedStyles.label}>Full Name</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="Enter your full name"
              placeholderTextColor={THEME.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </>
        )}

        <Text style={sharedStyles.label}>{mode === "signin" ? "Email or Phone" : "Phone Number"}</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder={mode === "signin" ? "Enter email or mobile number" : "e.g. +91 98765 43210"}
          placeholderTextColor={THEME.textMuted}
          value={mode === "signin" ? email : phone}
          onChangeText={mode === "signin" ? setEmail : setPhone}
          keyboardType={mode === "signin" ? "email-address" : "phone-pad"}
          autoCapitalize="none"
        />

        {mode === "signup" && (
          <>
            <Text style={sharedStyles.label}>Email Address</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="Enter your email"
              placeholderTextColor={THEME.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        <Text style={sharedStyles.label}>Password</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder={mode === "signin" ? "Enter your password" : "Create a strong password"}
          placeholderTextColor={THEME.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={loginStyles.sectionText}>Travel location</Text>
        <View style={loginStyles.locationRow}>
          <Pressable
            style={({ pressed }) => [loginStyles.locationOption, useCurrentLocation ? loginStyles.locationOptionSelected : null, pressed ? sharedStyles.buttonPressed : null]}
            onPress={() => setUseCurrentLocation(true)}
          >
            <Text style={loginStyles.locationOptionText}>📍 Use current location</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [loginStyles.locationOption, !useCurrentLocation ? loginStyles.locationOptionSelected : null, pressed ? sharedStyles.buttonPressed : null]}
            onPress={() => setUseCurrentLocation(false)}
          >
            <Text style={loginStyles.locationOptionText}>🏙️ Choose city</Text>
          </Pressable>
        </View>

        {!useCurrentLocation && (
          <>
            <Text style={sharedStyles.label}>City / Preferred Base</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="e.g. New Delhi, Jaipur, Bengaluru"
              placeholderTextColor={THEME.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </>
        )}

        {mode === "signin" && (
          <Pressable onPress={handleForgotPassword} style={loginStyles.forgotPasswordContainer}>
            <Text style={loginStyles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [sharedStyles.primaryButton, pressed ? sharedStyles.buttonPressed : null]}
          onPress={handleLogin}
        >
          <Text style={sharedStyles.primaryButtonText}>
            {mode === "signin" ? "Access My Travel Dashboard" : "Create Traveler Account"}
          </Text>
        </Pressable>

          <Text style={loginStyles.footerText}>
            {mode === "signin" ? "New traveler? " : "Already have an account? "}
            <Text style={loginStyles.footerActionText} onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create account" : "Sign in"}
            </Text>
          </Text>
        </View>
      </View>
      <ValidationPopup popup={popup} onClose={() => setPopup(null)} />
    </View>
  );
}

// ==========================================
// 2. USER DASHBOARD
// ==========================================
function DashboardScreen({ profile, rideHistory, onStartTrip, onLogout }: DashboardScreenProps) {
  const completedRides = rideHistory.filter((ride) => ride.status === "Completed");
  const totalSpent = completedRides.reduce((total, ride) => total + ride.price, 0);

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContainer, { alignItems: "center" }]} showsVerticalScrollIndicator={false}>
      <View style={sharedStyles.shell}>
        <View style={sharedStyles.headerRow}>
          <View>
            <Text style={sharedStyles.title}>Dashboard</Text>
            <Text style={sharedStyles.subtitle}>Your safe travel control center</Text>
          </View>
          <Pressable style={homeStyles.settingsButton} onPress={onLogout}>
            <Text style={homeStyles.settingsIcon}>↪</Text>
          </Pressable>
        </View>

        <View style={dashboardStyles.profileCard}>
          <Text style={dashboardStyles.profileEyebrow}>YatraGuard member</Text>
          <Text style={dashboardStyles.profileName}>Hello, {profile.fullName} 👋</Text>
          <Text style={dashboardStyles.profileContact}>{profile.email}</Text>
          <Text style={dashboardStyles.profileContact}>📞 {profile.phone}</Text>
          <Text style={dashboardStyles.profileLocation}>📍 {profile.city}</Text>
        </View>

        <View style={dashboardStyles.actionRow}>
          <Pressable
            style={({ pressed }) => [dashboardStyles.actionButton, dashboardStyles.actionPrimary, pressed ? sharedStyles.buttonPressed : null]}
            onPress={onStartTrip}
          >
            <Text style={dashboardStyles.actionIcon}>🚕</Text>
            <Text style={dashboardStyles.actionText}>Plan a ride</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [dashboardStyles.actionButton, pressed ? sharedStyles.buttonPressed : null]}
            onPress={() => Alert.alert("Safety contacts", "Your emergency contacts can be managed from your YatraGuard profile.")}
          >
            <Text style={dashboardStyles.actionIcon}>🛡️</Text>
            <Text style={dashboardStyles.actionText}>Safety center</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [dashboardStyles.actionButton, pressed ? sharedStyles.buttonPressed : null]}
            onPress={() => Alert.alert("Payment methods", "Payment method management will be available when live booking is connected.")}
          >
            <Text style={dashboardStyles.actionIcon}>💳</Text>
            <Text style={dashboardStyles.actionText}>Payments</Text>
          </Pressable>
        </View>

        <View style={dashboardStyles.statsRow}>
          <View style={dashboardStyles.statCard}>
            <Text style={dashboardStyles.statValue}>{completedRides.length}</Text>
            <Text style={dashboardStyles.statLabel}>Completed rides</Text>
          </View>
          <View style={dashboardStyles.statCard}>
            <Text style={dashboardStyles.statValue}>₹{totalSpent}</Text>
            <Text style={dashboardStyles.statLabel}>Total spent</Text>
          </View>
          <View style={dashboardStyles.statCard}>
            <Text style={dashboardStyles.statValue}>100%</Text>
            <Text style={dashboardStyles.statLabel}>Profile safety</Text>
          </View>
        </View>

        <View style={dashboardStyles.sectionHeader}>
          <Text style={dashboardStyles.sectionTitle}>Ride history</Text>
          <Text style={dashboardStyles.sectionHint}>{rideHistory.length} saved</Text>
        </View>

        {rideHistory.length > 0 ? rideHistory.map((ride) => (
          <View key={ride.id} style={dashboardStyles.historyCard}>
            <Text style={dashboardStyles.historyIcon}>{ride.icon}</Text>
            <View style={dashboardStyles.historyDetails}>
              <Text style={dashboardStyles.historyRide}>{ride.rideName}</Text>
              <Text style={dashboardStyles.historyRoute}>{ride.route}</Text>
            </View>
            <View>
              <Text style={dashboardStyles.historyPrice}>₹{ride.price}</Text>
              <Text style={dashboardStyles.historyStatus}>{ride.status}</Text>
            </View>
          </View>
        )) : (
          <View style={dashboardStyles.emptyHistory}>
            <Text style={dashboardStyles.emptyHistoryText}>Your completed rides will appear here after your first protected journey.</Text>
          </View>
        )}

        <View style={dashboardStyles.safetyCard}>
          <Text style={dashboardStyles.safetyTitle}>🟢 Protection profile active</Text>
          <Text style={dashboardStyles.safetyText}>Live route monitoring, SOS assistance, and destination tracking are ready for your next ride.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ==========================================
// 3. TRIP FORM SCREEN
// ==========================================
function TripFormScreen({ onSubmitForm, onBack }: TripFormScreenProps) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [travellerType, setTravellerType] = useState<"solo" | "group">("solo");
  const [memberCount, setMemberCount] = useState("1");
  const [popup, setPopup] = useState<PopupMessage | null>(null);

  const handleNext = () => {
    const missingTripDetails = [destination, budget].filter((value) => !value.trim()).length;
    if (missingTripDetails > 0) {
      setPopup({
        title: missingTripDetails === 2 ? "Trip details required" : "Trip details incomplete",
        message: missingTripDetails === 2
          ? "Please fill in the details first before continuing."
          : "Please fill in all the details first before continuing.",
      });
      return;
    }

    if (travellerType === "group" && (!memberCount.trim() || Number(memberCount) < 2)) {
      setPopup({ title: "Group details required", message: "Please fill in the group details first." });
      return;
    }

    if (Number.isNaN(Number(budget)) || Number(budget) <= 0) {
      setPopup({ title: "Invalid budget", message: "Please enter a valid budget greater than zero." });
      return;
    }

    onSubmitForm({ destination, budget: Number(budget) });
  };

  const summaryMode = travellerType === "solo" ? "Solo Trip" : `Group of ${memberCount || "0"}`;
  const summaryBudget = budget ? `₹${budget}` : "Budget";

  return (
    <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[sharedStyles.scrollContainer, { alignItems: "center" }]} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.shell}>
          <View style={sharedStyles.headerLeft}>
            <Text style={sharedStyles.title}>Plan Trip</Text>
            <Text style={sharedStyles.subtitle}>Let our AI optimize your budget and route.</Text>
          </View>

          <View style={tripStyles.summaryCard}>
            <View style={tripStyles.summaryRow}>
              <View style={tripStyles.summaryItem}>
                <Text style={tripStyles.summaryLabel}>Travel</Text>
                <Text style={tripStyles.summaryValue}>{summaryMode}</Text>
              </View>
              <View style={tripStyles.summaryItem}>
                <Text style={tripStyles.summaryLabel}>Budget</Text>
                <Text style={[tripStyles.summaryValue, tripStyles.summaryValueAccent]}>{summaryBudget}</Text>
              </View>
            </View>
          </View>

          <View style={sharedStyles.card}>
            <Text style={sharedStyles.heading}>Trip Parameters</Text>

            <Text style={loginStyles.sectionText}>Traveling as</Text>
            <View style={loginStyles.locationRow}>
              <Pressable
                style={({ pressed }) => [loginStyles.locationOption, travellerType === "solo" ? loginStyles.locationOptionSelected : null, pressed ? sharedStyles.buttonPressed : null]}
                onPress={() => setTravellerType("solo")}
              >
                <Text style={loginStyles.locationOptionText}>👤 Solo</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [loginStyles.locationOption, travellerType === "group" ? loginStyles.locationOptionSelected : null, pressed ? sharedStyles.buttonPressed : null]}
                onPress={() => setTravellerType("group")}
              >
                <Text style={loginStyles.locationOptionText}>👥 Group</Text>
              </Pressable>
            </View>

            {travellerType === "group" && (
              <>
                <Text style={sharedStyles.label}>Number of Travelers</Text>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="e.g., 4"
                  placeholderTextColor={THEME.textMuted}
                  value={memberCount}
                  onChangeText={setMemberCount}
                  keyboardType="numeric"
                />
              </>
            )}

            <Text style={sharedStyles.label}>Destination City / Hub</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="e.g., New Delhi, Mumbai..."
              placeholderTextColor={THEME.textMuted}
              value={destination}
              onChangeText={setDestination}
            />

            <Text style={sharedStyles.label}>Allocated Budget (₹)</Text>
            <TextInput
              style={sharedStyles.input}
              placeholder="e.g., 5000"
              placeholderTextColor={THEME.textMuted}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />

            <Pressable
              style={({ pressed }) => [sharedStyles.primaryButton, pressed ? sharedStyles.buttonPressed : null]}
              onPress={handleNext}
            >
              <Text style={sharedStyles.primaryButtonText}>Generate Safe Fares</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [sharedStyles.backButton, { marginTop: 20, marginBottom: 0 }, pressed ? sharedStyles.buttonPressed : null]}
            onPress={onBack}
          >
            <Text style={sharedStyles.backButtonText}>← Back</Text>
          </Pressable>
        </View>
      </ScrollView>
      <ValidationPopup popup={popup} onClose={() => setPopup(null)} />
    </KeyboardAvoidingView>
  );
}

// ==========================================
// 3. HOME / FAIR FARE SCREEN
// ==========================================
function HomeScreen({ onLogout, tripDetails, onLockRide, onBack }: HomeScreenProps) {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState(tripDetails.destination);
  const [showFares, setShowFares] = useState(false);

  const compareFares = () => {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert("Missing information", "Enter pickup and destination to calculate routes.");
      return;
    }
    setShowFares(true);
  };

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={[sharedStyles.scrollContainer, { alignItems: "center" }]} showsVerticalScrollIndicator={false}>
      <View style={sharedStyles.shell}>
        <View style={sharedStyles.headerRow}>
          <View>
            <Text style={sharedStyles.title}>Yatra<Text style={{ color: THEME.primary }}>Guard </Text></Text>
            <Text style={sharedStyles.subtitle}>Budget: ₹{tripDetails.budget}</Text>
          </View>
          <Pressable style={homeStyles.settingsButton} onPress={onLogout}>
            <Text style={homeStyles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.heading}>Find a Safe Ride</Text>
          <TextInput style={sharedStyles.input} placeholder="📍  Current Location" placeholderTextColor={THEME.textMuted} value={pickup} onChangeText={setPickup} />
          <TextInput style={sharedStyles.input} placeholder="📍  Drop Location" placeholderTextColor={THEME.textMuted} value={destination} onChangeText={setDestination} />
          <Pressable style={({ pressed }) => [sharedStyles.primaryButton, pressed ? sharedStyles.buttonPressed : null]} onPress={compareFares}>
            <Text style={sharedStyles.primaryButtonText}>Analyze Routes & Fares</Text>
          </Pressable>
        </View>

        {showFares && (
          <View style={homeStyles.resultsSection}>
            <Text style={sharedStyles.heading}>AI Recommended Rides</Text>
            {rides.map((ride, index) => {
              const isBest = index === 0;
              return (
                <Pressable
                  key={ride.name}
                  onPress={() => onLockRide(ride, pickup)}
                  style={({ pressed }) => [isBest ? homeStyles.bestCard : homeStyles.fareCard, pressed ? sharedStyles.buttonPressed : null]}
                >
                  {isBest && <View style={homeStyles.bestBadge}><Text style={homeStyles.bestBadgeText}>OPTIMAL CHOICE</Text></View>}
                  <View style={homeStyles.fareRow}>
                    <Text style={homeStyles.fareIcon}>{ride.icon}</Text>
                    <View style={homeStyles.fareDetails}>
                      <Text style={homeStyles.fareName}>{ride.name}</Text>
                      <Text style={homeStyles.fareTime}>⏳ {ride.time} • 🛡️ Safe {ride.safetyScore}</Text>
                    </View>
                    <View style={homeStyles.priceContainer}>
                      <Text style={homeStyles.farePrice}>₹{ride.price}</Text>
                      <Text style={homeStyles.selectText}>Lock ➔</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [sharedStyles.backButton, { marginTop: 20, marginBottom: 0 }, pressed ? sharedStyles.buttonPressed : null]}
          onPress={onBack}
        >
          <Text style={sharedStyles.backButtonText}>← Back</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ==========================================
// 4. LOCK ROUTE SCREEN
// ==========================================
function LockRouteScreen({ ride, pickup, destination, onStartJourney, onCancel, onBack }: LockRouteScreenProps) {
  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.shell}>
        <View style={sharedStyles.headerLeft}>
          <Text style={sharedStyles.title}>Confirm Route</Text>
          <Text style={sharedStyles.subtitle}>Locking GPS nodes for deviation tracking.</Text>
        </View>
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.heading}>Route Locked 🔒</Text>
          
          <View style={lockStyles.routeInfo}>
            <Text style={lockStyles.routeText}><Text style={{fontWeight: 'bold', color: THEME.primary}}>From:</Text> {pickup}</Text>
            <Text style={lockStyles.routeText}><Text style={{fontWeight: 'bold', color: THEME.primary}}>To:</Text> {destination}</Text>
          </View>

          <View style={lockStyles.rideInfo}>
            <Text style={homeStyles.fareIcon}>{ride.icon}</Text>
            <View style={lockStyles.rideDetails}>
              <Text style={homeStyles.fareName}>{ride.name}</Text>
              <Text style={homeStyles.farePrice}>₹{ride.price}</Text>
              <Text style={lockStyles.etaLabel}>Drop-off in</Text>
              <Text style={lockStyles.etaValue}>{ride.time}</Text>
            </View>
          </View>

          <Pressable style={({ pressed }) => [sharedStyles.primaryButton, {marginTop: 30}, pressed ? sharedStyles.buttonPressed : null]} onPress={onStartJourney}>
            <Text style={sharedStyles.primaryButtonText}>Enable Tracking & Start</Text>
          </Pressable>
          
          <Pressable style={({ pressed }) => [sharedStyles.secondaryButton, pressed ? sharedStyles.buttonPressed : null]} onPress={onCancel}>
            <Text style={sharedStyles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [sharedStyles.backButton, { marginTop: 20, marginBottom: 0 }, pressed ? sharedStyles.buttonPressed : null]}
          onPress={onBack}
        >
          <Text style={sharedStyles.backButtonText}>← Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==========================================
// 5. SAFETY SCREEN 
// ==========================================
function SafetyScreen({ ride, destination, onEndJourney }: SafetyScreenProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Coordinate | null>(null);
  const [locationError, setLocationError] = useState("");
  const [sosPopup, setSosPopup] = useState<PopupMessage | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let browserWatchId: number | null = null;
    let isMounted = true;

    const startLocationTracking = async () => {
      if (Platform.OS === "web") {
        if (!navigator.geolocation) {
          setLocationError("This browser does not support live location.");
          return;
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(destination)}`,
          );
          const places = await response.json() as Array<{ lat: string; lon: string }>;
          if (isMounted && places[0]) {
            setDestinationLocation({
              latitude: Number(places[0].lat),
              longitude: Number(places[0].lon),
            });
          } else if (isMounted) {
            setLocationError(`Could not find a map location for "${destination}".`);
          }
        } catch {
          if (isMounted) {
            setLocationError("Destination lookup failed. Check your internet connection.");
          }
        }

        browserWatchId = navigator.geolocation.watchPosition(
          (position) => {
            if (isMounted) {
              setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          },
          () => {
            if (isMounted) {
              setLocationError("Allow location access in your browser to show your position.");
            }
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationError("Location permission was denied. Enable it in your phone settings.");
        return;
      }

      try {
        const destinationMatches = await Location.geocodeAsync(destination);
        if (isMounted && destinationMatches.length > 0) {
          setDestinationLocation({
            latitude: destinationMatches[0].latitude,
            longitude: destinationMatches[0].longitude,
          });
        } else if (isMounted) {
          setLocationError(`Could not find a map location for "${destination}".`);
        }
      } catch {
        if (isMounted) {
          setLocationError("Destination lookup failed. Check your internet connection.");
        }
      }

      try {
        const initialPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (isMounted) {
          setCurrentLocation({
            latitude: initialPosition.coords.latitude,
            longitude: initialPosition.coords.longitude,
          });
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (position) => {
            if (isMounted) {
              setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            }
          },
        );
      } catch {
        if (isMounted) {
          setLocationError("Unable to read GPS. Turn on Location services and try again.");
        }
      }
    };

    startLocationTracking().catch(() => {
      if (isMounted) {
        setLocationError("Location setup failed. Restart the app and try again.");
      }
    });

    return () => {
      isMounted = false;
      locationSubscription?.remove();
      if (browserWatchId !== null) {
        navigator.geolocation.clearWatch(browserWatchId);
      }
    };
  }, [destination]);

  const distanceLeft = currentLocation && destinationLocation
    ? getDistanceInKilometers(currentLocation, destinationLocation)
    : null;
  const mapHeight = Math.round(windowHeight * 0.5);
  const mapWidth = windowWidth >= 768 ? Math.round(windowWidth * 0.7) : Math.max(windowWidth - 40, 280);

  const triggerSOS = () => {
    setSosPopup({
      title: "🚨 SOS Triggered",
      message: "Your SOS has been triggered. Your live coordinates have been sent to emergency contacts and the nearest Safe Haven.",
    });
  };

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.headerLeft}>
        <Text style={sharedStyles.title}>Journey Active</Text>
      </View>

      <View style={safetyStyles.topRow}>
        <View style={[safetyStyles.statusCard, { flex: 1, marginBottom: 0 }]}>
          <Text style={safetyStyles.statusTitle}>🛡️ YatraGuard Protection Active</Text>
          <Text style={safetyStyles.statusText}>🟢 Route Deviation Logic: <Text style={{fontWeight: 'bold'}}>Monitoring</Text></Text>
          <Text style={safetyStyles.statusText}>🟢 Live GPS Polling: <Text style={{fontWeight: 'bold'}}>Every 5s</Text></Text>
          <Text style={safetyStyles.statusText}>📍 Nearest Safe Haven: <Text style={{fontWeight: 'bold'}}>Police Station (1.2km)</Text></Text>
        </View>

        <View style={safetyStyles.sosContainer}>
          <View style={safetyStyles.sosRipple}>
            <Pressable 
              style={({ pressed }) => [safetyStyles.sosButton, pressed ? sharedStyles.buttonPressed : null]} 
              onLongPress={triggerSOS}
              delayLongPress={2000}
              onPress={() => Alert.alert("Hold to Trigger", "Press and hold for 2 seconds to avoid accidental triggers.")}
            >
              <Text style={safetyStyles.sosText}>SOS</Text>
            </Pressable>
          </View>
          <Text style={safetyStyles.sosHelpText}>HOLD FOR EMERGENCY ASSISTANCE</Text>
        </View>
      </View>

      {currentLocation ? (
        <View style={safetyStyles.mapSection}>
          <Text style={safetyStyles.distanceText}>
            {distanceLeft === null ? "Your location is shown. Finding destination..." : `${distanceLeft.toFixed(1)} km left to destination`}
          </Text>
          <LiveMap currentLocation={currentLocation} destinationLocation={destinationLocation} destination={destination} width={mapWidth} height={mapHeight} />
        </View>
      ) : (
        <Text style={safetyStyles.mapMessage}>{locationError || "Finding your location and destination..."}</Text>
      )}

      <Pressable style={({ pressed }) => [sharedStyles.secondaryButton, {marginTop: 'auto'}, pressed ? sharedStyles.buttonPressed : null]} onPress={onEndJourney}>
        <Text style={sharedStyles.secondaryButtonText}>Complete Journey Successfully</Text>
      </Pressable>
      <ValidationPopup popup={sosPopup} onClose={() => setSosPopup(null)} />
    </View>
  );
}

function getDistanceInKilometers(start: Coordinate, end: Coordinate) {
  const earthRadius = 6371;
  const latitudeDifference = ((end.latitude - start.latitude) * Math.PI) / 180;
  const longitudeDifference = ((end.longitude - start.longitude) * Math.PI) / 180;
  const startLatitude = (start.latitude * Math.PI) / 180;
  const endLatitude = (end.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDifference / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPlanningTrip, setIsPlanningTrip] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [lockedRide, setLockedRide] = useState<{ ride: Ride; pickup: string } | null>(null);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [rideHistory, setRideHistory] = useState<RideHistoryItem[]>([]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsPlanningTrip(false);
    setTripDetails(null);
    setLockedRide(null);
    setIsJourneyActive(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(profile) => {
      setUserProfile(profile);
      setIsLoggedIn(true);
    }} />;
  }

  if (userProfile && !isPlanningTrip) {
    return (
      <DashboardScreen
        profile={userProfile}
        rideHistory={rideHistory}
        onStartTrip={() => setIsPlanningTrip(true)}
        onLogout={handleLogout}
      />
    );
  }

  if (!tripDetails) {
    return (
      <TripFormScreen
        onSubmitForm={(details) => setTripDetails(details)}
        onBack={() => setIsPlanningTrip(false)}
      />
    );
  }

  if (!lockedRide) {
    return (
      <HomeScreen
        onLogout={handleLogout}
        onBack={() => setTripDetails(null)}
        tripDetails={tripDetails}
        onLockRide={(ride, pickup) => setLockedRide({ ride, pickup })}
      />
    );
  }

  if (!isJourneyActive && lockedRide && tripDetails) {
    return <LockRouteScreen 
      ride={lockedRide.ride} 
      pickup={lockedRide.pickup} 
      destination={tripDetails.destination}
      onStartJourney={() => setIsJourneyActive(true)}
      onCancel={() => setLockedRide(null)}
      onBack={() => setLockedRide(null)}
    />;
  }

  if (isJourneyActive && lockedRide && tripDetails) {
    return <SafetyScreen 
      ride={lockedRide.ride} 
      destination={tripDetails.destination} 
      onEndJourney={() => {
        if (lockedRide && tripDetails) {
          setRideHistory((history) => [
            {
              id: `${Date.now()}`,
              rideName: lockedRide.ride.name,
              icon: lockedRide.ride.icon,
              route: `${lockedRide.pickup} → ${tripDetails.destination}`,
              price: lockedRide.ride.price,
              status: "Completed",
            },
            ...history,
          ]);
        }
        setIsJourneyActive(false);
        setLockedRide(null);
        setTripDetails(null);
        setIsPlanningTrip(false);
      }} 
    />;
  }

  return null; // Fallback to prevent any React return errors
}
