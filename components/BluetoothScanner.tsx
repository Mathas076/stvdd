import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import CustomText from './Text';
import IconButton from './Button';
import BluetoothDeviceItem from './BluetoothDeviceItem';
import { useBluetooth } from '@/lib/hooks/bluetooth/useBluetooth';

/**
 * Organismo: BluetoothScanner
 * Gestiona el escaneo de dispositivos y muestra la lista de resultados.
 * Es un componente autónomo que encapsula la lógica de Bluetooth.
 */
const BluetoothScanner = () => {
  const {
    isReady,
    isScanning,
    scannedDevices,
    connectedDevice,
    isConnecting,
    error,
    startScan,
    stopScan,
    connect,
    disconnect,
    clearError,
  } = useBluetooth();

  const handleToggleScan = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabecera del Organismo */}
      <View style={styles.header}>
        <View>
          <CustomText variant="title">Escáner BLE</CustomText>
          <CustomText variant="normal" style={styles.statusText}>
            Estado: {isReady ? 'Listo' : 'Apagado o Sin Permisos'}
          </CustomText>
        </View>
        
        <IconButton
          icon={isScanning ? "stop" : "search"}
          pulsar={handleToggleScan}
          variant={isScanning ? "danger" : "primary"}
          disabled={!isReady}
          label={isScanning ? "Detener" : "Buscar"}
        />
      </View>

      {/* Mensaje de Error (si existe) */}
      {error && (
        <View style={styles.errorBanner}>
          <CustomText variant="normal" style={styles.errorText}>
            {error.message}
          </CustomText>
          <IconButton icon="close" pulsar={clearError} size="sm" variant="ghost" />
        </View>
      )}

      {/* Dispositivo Conectado Actual */}
      {connectedDevice && (
        <View style={styles.connectedSection}>
          <CustomText variant="subtitle" style={styles.sectionTitle}>Conectado</CustomText>
          <BluetoothDeviceItem
            device={connectedDevice}
            isConnected={true}
            isConnecting={false}
            onConnect={() => {}}
            onDisconnect={disconnect}
          />
        </View>
      )}

      {/* Lista de Dispositivos Escaneados */}
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <CustomText variant="subtitle" style={styles.sectionTitle}>Dispositivos cercanos</CustomText>
          {isScanning && <ActivityIndicator size="small" color="#2563EB" />}
        </View>

        <FlatList
          data={scannedDevices.filter(d => d.id !== connectedDevice?.id)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BluetoothDeviceItem
              device={item}
              isConnecting={isConnecting}
              isConnected={false}
              onConnect={connect}
            />
          )}
          ListEmptyComponent={
            !isScanning ? (
              <View style={styles.emptyContainer}>
                <CustomText variant="normal" style={styles.emptyText}>
                  Pulsa buscar para encontrar dispositivos
                </CustomText>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 14,
  },
  connectedSection: {
    marginBottom: 24,
  },
  listSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default BluetoothScanner;
