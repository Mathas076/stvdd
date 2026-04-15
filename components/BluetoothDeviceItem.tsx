import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import CustomText from './Text';
import IconButton from './Button';
import { BluetoothDevice } from '@/lib/core/bluetooth/bluetoothTypes';
import Ionicons from '@expo/vector-icons/Ionicons';

interface BluetoothDeviceItemProps {
  device: BluetoothDevice;
  isConnecting?: boolean;
  isConnected?: boolean;
  onConnect: (device: BluetoothDevice) => void;
  onDisconnect?: () => void;
}

const BluetoothDeviceItem = ({
  device,
  isConnecting = false,
  isConnected = false,
  onConnect,
  onDisconnect,
}: BluetoothDeviceItemProps) => {
  
  const getSignalColor = (rssi: number | null) => {
    if (!rssi) return '#9CA3AF';
    if (rssi > -60) return '#10B981';
    if (rssi > -80) return '#F59E0B';
    return '#EF4444';
  };

  const signalColor = getSignalColor(device.rssi);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isConnected ? "bluetooth" : "bluetooth-outline"} 
          size={24} 
          color={isConnected ? "#2563EB" : signalColor} 
        />
        {device.rssi && (
          <CustomText variant="normal" style={[styles.rssiText, { color: signalColor }]}>
            {device.rssi} dBm
          </CustomText>
        )}
      </View>

      <View style={styles.infoContainer}>
        <CustomText variant="subtitle" numberOfLines={1} style={styles.deviceName}>
          {device.name || 'Dispositivo Desconocido'}
        </CustomText>
        <CustomText variant="normal" style={styles.deviceId}>
          {device.id}
        </CustomText>
      </View>

      <View style={styles.actionContainer}>
        {isConnecting ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : isConnected ? (
          <IconButton
            icon="close-circle"
            pulsar={() => onDisconnect?.()}
            variant="danger"
            size="sm"
            label="Desconectar"
          />
        ) : (
          <IconButton
            icon="link"
            pulsar={() => onConnect(device)}
            variant="primary"
            size="sm"
            label="Conectar"
            disabled={device.isConnectable === false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
    width: 50,
  },
  rssiText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  deviceName: {
    fontSize: 16,
    color: '#1F2937',
  },
  deviceId: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionContainer: {
    marginLeft: 12,
    minWidth: 80,
    alignItems: 'center',
  },
});

export default BluetoothDeviceItem;
