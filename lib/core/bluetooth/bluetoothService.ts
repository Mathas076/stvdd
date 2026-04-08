// lib/core/bluetooth/bluetoothService.ts
import { BleManager, Device, State, Characteristic } from 'react-native-ble-plx'
import { Platform, PermissionsAndroid } from 'react-native'
import { base64ToBytes, bytesToBase64 } from './bluetoothUtils'
import type { BLEDevice, ScanCallback, DataCallback } from './bluetoothTypes'

class BluetoothService {
  private manager: BleManager | null = null

  init() {
    if (!this.manager) {
      this.manager = new BleManager()
    }
    return this.manager
  }

  private getManager(): BleManager {
    if (!this.manager) throw new Error('BluetoothService no inicializado')
    return this.manager
  }

  // --- Permisos ---
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') return true

    if (Platform.Version >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ])
      return Object.values(results).every(r => r === 'granted')
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    )
    return result === 'granted'
  }

  // --- Estado del adaptador ---
  onStateChange(callback: (state: State) => void) {
    return this.getManager().onStateChange(callback, true)
  }

  // --- Scan ---
  startScan(onDevice: ScanCallback, onFinish?: () => void) {
    this.getManager().startDeviceScan(null, null, (error, device) => {
      if (error) { onFinish?.(); return }
      if (device) onDevice(device)
    })
    // auto-stop a los 10 segundos
    setTimeout(() => { this.stopScan(); onFinish?.() }, 10_000)
  }

  stopScan() {
    this.getManager().stopDeviceScan()
  }

  // --- Conexión ---
  async connect(deviceId: string): Promise<Device> {
    const device = await this.getManager().connectToDevice(deviceId)
    await device.discoverAllServicesAndCharacteristics()
    return device
  }

  async disconnect(deviceId: string) {
    await this.getManager().cancelDeviceConnection(deviceId)
  }

  async isConnected(deviceId: string): Promise<boolean> {
    return this.getManager().isDeviceConnected(deviceId)
  }

  // --- Lectura / escritura ---
  async readChar(
    deviceId: string,
    serviceUUID: string,
    charUUID: string
  ): Promise<Uint8Array> {
    const char = await this.getManager().readCharacteristicForDevice(
      deviceId, serviceUUID, charUUID
    )
    return base64ToBytes(char.value ?? '')
  }

  async writeChar(
    deviceId: string,
    serviceUUID: string,
    charUUID: string,
    data: Uint8Array
  ): Promise<Characteristic> {
    return this.getManager().writeCharacteristicWithResponseForDevice(
      deviceId, serviceUUID, charUUID, bytesToBase64(data)
    )
  }

  // --- Notificaciones en tiempo real ---
  monitor(
    deviceId: string,
    serviceUUID: string,
    charUUID: string,
    onData: DataCallback
  ) {
    return this.getManager().monitorCharacteristicForDevice(
      deviceId, serviceUUID, charUUID,
      (error, char) => {
        if (error || !char?.value) return
        onData(base64ToBytes(char.value))
      }
    )
  }

  // --- Limpieza ---
  destroy() {
    this.manager?.destroy()
    this.manager = null
  }
}

export const bluetoothService = new BluetoothService()