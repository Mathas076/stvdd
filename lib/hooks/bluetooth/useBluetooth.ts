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
} from '@/lib/core/bluetooth/bluetoothTypes';

// ─── Estado interno ───────────────────────────────────────────
interface UseBluetoothState {
  adapterState: BluetoothAdapterState;
  connectedDevice: ConnectedDevice | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
  error: BluetoothError | null;
}

// ─── Return type del hook ─────────────────────────────────────
interface UseBluetoothReturn extends UseBluetoothState {
  isReady: boolean;
  connect: (device: BluetoothDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export function useBluetooth(): UseBluetoothReturn {
  const [state, setState] = useState<UseBluetoothState>({
    // IMPORTANTE: Coincidir con el tipo BluetoothAdapterState (PascalCase)
    adapterState: 'Unknown', 
    connectedDevice: null,
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
    };
  }, []);

  const safeSetState = useCallback(
    (partial: Partial<UseBluetoothState>) => {
      if (isMounted.current) {
        setState((prev) => ({ ...prev, ...partial }));
      }
    },
    []
  );

  // ─── Escuchar estado del adaptador ──────────────────────────
  useEffect(() => {
    // Suscripción al cambio de estado (PoweredOn, PoweredOff, etc.)
    const unsubscribe = bluetoothService.onAdapterStateChange((newState: State) => {
      safeSetState({ adapterState: newState as BluetoothAdapterState });

      // Si el Bluetooth se apaga, desconectamos visualmente el dispositivo
      if (newState !== State.PoweredOn) {
        safeSetState({ connectedDevice: null });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [safeSetState]);

  // ─── Conectar ───────────────────────────────────────────────
  const connect = useCallback(
    async (device: BluetoothDevice) => {
      // Evitar múltiples intentos de conexión simultáneos
      if (state.isConnecting || state.connectedDevice) return;

      safeSetState({ isConnecting: true, error: null });

      try {
        const connected = await bluetoothService.connect(
          device.id,
          // Callback de desconexión inesperada (p. ej. se alejó el dispositivo)
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
    [state.isConnecting, state.connectedDevice, safeSetState]
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
    // Verificamos contra el valor exacto de la librería
    isReady: state.adapterState === 'PoweredOn',
    connect,
    disconnect,
    clearError,
  };
}