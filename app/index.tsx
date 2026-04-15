import { View, StyleSheet, SafeAreaView, StatusBar, ScrollView } from "react-native";
import BluetoothScanner from "@/components/BluetoothScanner";
import Card from "@/components/Card";

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          
          {/* SECCIÓN DE CARDS (45% ancho cada una) */}
          <View style={styles.cardsContainer}>
            <Card 
              title="Titulo 1" 
              description="Se va a dar informacion en un futuro." 
              style={styles.cardItem} 
            />
            <Card 
              title="Modo de uso" 
              description="Coming soon." 
              style={styles.cardItem} 
            />
            <Card 
              title="Uso de b" 
              description="Se explica brevemente." 
              style={styles.cardItem} 
            />
          </View>

          {/* COMPONENTE DE ESCANEO */}
          <BluetoothScanner />
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cardItem: {
    width: '45%', // Cada tarjeta ocupa el 45% del ancho
    marginBottom: 15,
  },
});
