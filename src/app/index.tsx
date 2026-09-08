import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ==========================================
// TYPESCRIPT DEFINITIONS
// ==========================================
type TripDetails = {
  destination: string;
  budget: number;
  days: number;
};

type Ride = {
  name: string;
  icon: string;
  price: number;
  time: string;
  safetyScore: string;
};

type LoginScreenProps = {
  onLogin: () => void;
};

type TripFormScreenProps = {
  onSubmitForm: (details: TripDetails) => void;
};

type HomeScreenProps = {
  onLogout: () => void;
  tripDetails: TripDetails;
  onLockRide: (ride: Ride, pickup: string) => void;
};

type LockRouteScreenProps = {
  ride: Ride;
  pickup: string;
  destination: string;
  onStartJourney: () => void;
  onCancel: () => void;
};

type SafetyScreenProps = {
  ride: Ride;
  destination: string;
  onEndJourney: () => void;
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
  container: { flex: 1, backgroundColor: THEME.background, padding: 24, justifyContent: "center" },
  scrollContainer: { padding: 24, paddingTop: 65, paddingBottom: 40 },
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
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});

const loginStyles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 35 },
  logo: { fontSize: 44, fontWeight: "900", color: THEME.textMain, letterSpacing: -1 },
  tagline: { fontSize: 15, color: THEME.textMuted, marginTop: 5, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "800", color: THEME.textMain },
  subtitle: { fontSize: 14, color: THEME.textMuted, marginTop: 6, marginBottom: 25 },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -10 },
  forgotPasswordText: { color: THEME.primary, fontSize: 14, fontWeight: "600" },
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

const lockStyles = StyleSheet.create({
  routeInfo: { backgroundColor: THEME.secondary, padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#DDB6FE", borderStyle: 'dashed' },
  routeText: { fontSize: 15, color: THEME.textMain, marginBottom: 5 },
  rideInfo: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.background, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
});

const safetyStyles = StyleSheet.create({
  statusCard: { backgroundColor: THEME.card, borderRadius: 18, padding: 20, marginBottom: 30, borderWidth: 2, borderColor: THEME.primary, elevation: 4 },
  statusTitle: { fontSize: 17, fontWeight: "800", color: THEME.primaryDark, marginBottom: 12 },
  statusText: { fontSize: 14, color: THEME.textMain, marginTop: 6, fontWeight: "500" },
  sosContainer: { alignItems: "center", justifyContent: "center", marginVertical: 20 },
  sosRipple: { width: 190, height: 190, borderRadius: 95, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }, 
  sosButton: { width: 150, height: 150, borderRadius: 75, backgroundColor: THEME.danger, alignItems: "center", justifyContent: "center", elevation: 12, shadowColor: THEME.danger, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 10 },
  sosText: { color: THEME.card, fontSize: 44, fontWeight: "900", letterSpacing: 2 },
  sosHelpText: { color: THEME.danger, fontSize: 12, marginTop: 15, fontWeight: "800", letterSpacing: 1 },
});

// ==========================================
// 1. LOGIN SCREEN
// ==========================================
function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter your email and password.");
      return;
    }
    onLogin();
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
      <View style={loginStyles.header}>
        <Text style={loginStyles.logo}>Yatra<Text style={{ color: THEME.primary }}>Guard</Text></Text>
        <Text style={loginStyles.tagline}>Smart routing. Safe journeys.</Text>
      </View>

      <View style={sharedStyles.card}>
        <Text style={loginStyles.title}>Welcome Back 👋</Text>
        <Text style={loginStyles.subtitle}>Secure your travel with YatraGuard</Text>

        <Text style={sharedStyles.label}>Email</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder="Enter your email"
          placeholderTextColor={THEME.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={sharedStyles.label}>Password</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder="Enter your password"
          placeholderTextColor={THEME.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable onPress={handleForgotPassword} style={loginStyles.forgotPasswordContainer}>
          <Text style={loginStyles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [sharedStyles.primaryButton, pressed ? sharedStyles.buttonPressed : null]}
          onPress={handleLogin}
        >
          <Text style={sharedStyles.primaryButtonText}>Secure Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==========================================
// 2. TRIP FORM SCREEN
// ==========================================
function TripFormScreen({ onSubmitForm }: TripFormScreenProps) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");

  const handleNext = () => {
    if (!destination.trim() || !budget.trim() || !days.trim()) {
      Alert.alert("Incomplete Form", "Please fill in all details for AI Optimization.");
      return;
    }
    onSubmitForm({ destination, budget: parseFloat(budget), days: parseInt(days, 10) });
  };

  return (
    <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={sharedStyles.headerLeft}>
          <Text style={sharedStyles.title}>Plan Trip</Text>
          <Text style={sharedStyles.subtitle}>Let our AI optimize your budget and route.</Text>
        </View>

        <View style={sharedStyles.card}>
          <Text style={sharedStyles.heading}>Trip Parameters</Text>

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

          <Text style={sharedStyles.label}>Duration (Days)</Text>
          <TextInput
            style={sharedStyles.input}
            placeholder="e.g., 3"
            placeholderTextColor={THEME.textMuted}
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
          />

          <Pressable
            style={({ pressed }) => [sharedStyles.primaryButton, pressed ? sharedStyles.buttonPressed : null]}
            onPress={handleNext}
          >
            <Text style={sharedStyles.primaryButtonText}>Generate Safe Fares</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// 3. HOME / FAIR FARE SCREEN
// ==========================================
function HomeScreen({ onLogout, tripDetails, onLockRide }: HomeScreenProps) {
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
    <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={sharedStyles.headerRow}>
        <View>
          <Text style={sharedStyles.title}>Yatra<Text style={{ color: THEME.primary }}>Guard</Text></Text>
          <Text style={sharedStyles.subtitle}>Budget: ₹{tripDetails.budget} • {tripDetails.days} Days</Text>
        </View>
        <Pressable style={homeStyles.settingsButton} onPress={onLogout}>
          <Text style={homeStyles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.heading}>Find a Safe Ride</Text>
        <TextInput style={sharedStyles.input} placeholder="📍  Current Location" placeholderTextColor={THEME.textMuted} value={pickup} onChangeText={setPickup} />
        <TextInput style={sharedStyles.input} placeholder="📍  Destination" placeholderTextColor={THEME.textMuted} value={destination} onChangeText={setDestination} />
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
    </ScrollView>
  );
}

// ==========================================
// 4. LOCK ROUTE SCREEN
// ==========================================
function LockRouteScreen({ ride, pickup, destination, onStartJourney, onCancel }: LockRouteScreenProps) {
  return (
    <View style={sharedStyles.container}>
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
          <View>
            <Text style={homeStyles.fareName}>{ride.name}</Text>
            <Text style={homeStyles.farePrice}>₹{ride.price}</Text>
          </View>
        </View>

        <Pressable style={({ pressed }) => [sharedStyles.primaryButton, {marginTop: 30}, pressed ? sharedStyles.buttonPressed : null]} onPress={onStartJourney}>
          <Text style={sharedStyles.primaryButtonText}>Enable Tracking & Start</Text>
        </Pressable>
        
        <Pressable style={({ pressed }) => [sharedStyles.secondaryButton, pressed ? sharedStyles.buttonPressed : null]} onPress={onCancel}>
          <Text style={sharedStyles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==========================================
// 5. SAFETY SCREEN 
// ==========================================
function SafetyScreen({ ride, destination, onEndJourney }: SafetyScreenProps) {
  const triggerSOS = () => {
    Alert.alert(
      "🚨 CRITICAL SOS TRIGGERED", 
      "Local authorities, nearest Safe Haven, and Emergency Contacts have received your live coordinates.", 
      [{ text: "Acknowledge", style: "destructive" }]
    );
  };

  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.headerLeft}>
        <Text style={sharedStyles.title}>Journey Active</Text>
        <Text style={sharedStyles.subtitle}>En route to {destination}</Text>
      </View>

      <View style={safetyStyles.statusCard}>
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
            onPress={() => Alert.alert("Hold to Trigger", "Press and hold for 2 seconds to avoid accidental triggers.")}
          >
            <Text style={safetyStyles.sosText}>SOS</Text>
          </Pressable>
        </View>
        <Text style={safetyStyles.sosHelpText}>HOLD FOR EMERGENCY ASSISTANCE</Text>
      </View>

      <Pressable style={({ pressed }) => [sharedStyles.secondaryButton, {marginTop: 'auto'}, pressed ? sharedStyles.buttonPressed : null]} onPress={onEndJourney}>
        <Text style={sharedStyles.secondaryButtonText}>Complete Journey Successfully</Text>
      </Pressable>
    </View>
  );
}
// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [lockedRide, setLockedRide] = useState<{ ride: Ride; pickup: string } | null>(null);
  const [isJourneyActive, setIsJourneyActive] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTripDetails(null);
    setLockedRide(null);
    setIsJourneyActive(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  if (!tripDetails) {
    return <TripFormScreen onSubmitForm={(details) => setTripDetails(details)} />;
  }

  if (!lockedRide) {
    return <HomeScreen onLogout={handleLogout} tripDetails={tripDetails} onLockRide={(ride, pickup) => setLockedRide({ ride, pickup })} />;
  }

  if (!isJourneyActive && lockedRide && tripDetails) {
    return <LockRouteScreen 
      ride={lockedRide.ride} 
      pickup={lockedRide.pickup} 
      destination={tripDetails.destination}
      onStartJourney={() => setIsJourneyActive(true)}
      onCancel={() => setLockedRide(null)}
    />;
  }

  if (isJourneyActive && lockedRide && tripDetails) {
    return <SafetyScreen 
      ride={lockedRide.ride} 
      destination={tripDetails.destination} 
      onEndJourney={() => {
        setIsJourneyActive(false);
        setLockedRide(null);
      }} 
    />;
  }

  return null; // Fallback to prevent any React return errors
}
