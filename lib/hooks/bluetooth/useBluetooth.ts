// hooks/useBluetooth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { State } from 'react-native-ble-plx';
import { bluetoothService } from '@/lib/core/bluetooth/bluetoothService';
import {
  BluetoothDevice,
  ConnectedDevice,
  BluetoothError,
  BluetoothAdapterState,
  ScanOptions,
} from '@/lib/core/bluetooth/bluetoothTypes';

// ─── Estado interno ───────────────────────────────────────────
interface UseBluetoothState {
  adapterState: BluetoothAdapterState;
  connectedDevice: ConnectedDevice | null;
  isScanning: boolean;
  scannedDevices: BluetoothDevice[];
  isConnecting: boolean;
  isDisconnecting: boolean;
  error: BluetoothError | null;
}

// ─── Return type del hook ─────────────────────────────────────
interface UseBluetoothReturn extends UseBluetoothState {
  isReady: boolean;
  startScan: (options?: ScanOptions) => void;
  stopScan: () => void;
  connect: (device: BluetoothDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export function useBluetooth(): UseBluetoothReturn {
  const [state, setState] = useState<UseBluetoothState>({
    adapterState: 'Unknown', 
    connectedDevice: null,
    isScanning: false,
    scannedDevices: [],
    isConnecting: false,
    isDisconnecting: false,
    error: null,
  });

  // Ref para evitar updates en componente desmontado
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      bluetoothService.stopScan();
    };
  }, []);

  const safeSetState = useCallback(
    (partial: Partial<UseBluetoothState> | ((prev: UseBluetoothState) => UseBluetoothState)) => {
      if (isMounted.current) {
        if (typeof partial === 'function') {
          setState(partial);
        } else {
          setState((prev) => ({ ...prev, ...partial }));
        }
      }
    },
    []
  );

  // ─── Escuchar estado del adaptador ──────────────────────────
  useEffect(() => {
    const unsubscribe = bluetoothService.onAdapterStateChange((newState: State) => {
      safeSetState({ adapterState: newState as BluetoothAdapterState });

      if (newState !== State.PoweredOn) {
        safeSetState({ connectedDevice: null, isScanning: false });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [safeSetState]);

  // ─── Escaneo ────────────────────────────────────────────────
  const startScan = useCallback((options?: ScanOptions) => {
    if (state.isScanning || state.adapterState !== 'PoweredOn') return;

    safeSetState({ isScanning: true, scannedDevices: [], error: null });

    bluetoothService.startScan(
      (device) => {
        safeSetState((prev) => {
          // Si el dispositivo ya está en la lista, lo actualizamos (por el RSSI)
          const index = prev.scannedDevices.findIndex((d) => d.id === device.id);
          if (index !== -1) {
            const newList = [...prev.scannedDevices];
            newList[index] = device;
            return { ...prev, scannedDevices: newList };
          }
          // Si es nuevo, lo añadimos
          return { ...prev, scannedDevices: [...prev.scannedDevices, device] };
        });
      },
      (error) => {
        safeSetState({ error, isScanning: false });
      },
      options
    );
  }, [state.isScanning, state.adapterState, safeSetState]);

  const stopScan = useCallback(() => {
    bluetoothService.stopScan();
    safeSetState({ isScanning: false });
  }, [safeSetState]);

  // ─── Conectar ───────────────────────────────────────────────
  const connect = useCallback(
    async (device: BluetoothDevice) => {
      if (state.isConnecting || state.connectedDevice) return;

      // Detener el escaneo al intentar conectar para mayor estabilidad
      stopScan();

      safeSetState({ isConnecting: true, error: null });

      try {
        const connected = await bluetoothService.connect(
          device.id,
          (error) => {
            safeSetState({
              connectedDevice: null,
              error: error ?? {
                code: 'CONNECTION_LOST',
                message: 'Device disconnected unexpectedly',
                deviceId: device.id,
              },
            });
          }
        );

        safeSetState({ connectedDevice: connected });
      } catch (error) {
        safeSetState({ error: error as BluetoothError });
      } finally {
        safeSetState({ isConnecting: false });
      }
    },
    [state.isConnecting, state.connectedDevice, safeSetState, stopScan]
  );

  // ─── Desconectar ────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    if (!state.connectedDevice || state.isDisconnecting) return;

    safeSetState({ isDisconnecting: true, error: null });

    try {
      await bluetoothService.disconnect(state.connectedDevice.id);
      safeSetState({ connectedDevice: null });
    } catch (error) {
      safeSetState({ error: error as BluetoothError });
    } finally {
      safeSetState({ isDisconnecting: false });
    }
  }, [state.connectedDevice, state.isDisconnecting, safeSetState]);

  // ─── Limpiar error ───────────────────────────────────────────
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  return {
    ...state,
    isReady: state.adapterState === 'PoweredOn',
    startScan,
    stopScan,
    connect,
    disconnect,
    clearError,
  };
}