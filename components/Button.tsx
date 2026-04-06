import React, { useRef } from 'react'
import { Pressable, Animated, View, Text, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

interface IconButtonProps {
  pulsar: () => void
  icon: string
  enlace?: string
  color?: string
  label?: string
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { icon: 20, padding: 8, radius: 10 },
  md: { icon: 28, padding: 12, radius: 14 },
  lg: { icon: 36, padding: 16, radius: 18 },
}

const VARIANTS = {
  primary: {
    bg: '#FFFFFF',
    border: '#9CA3AF',
    shadow: '#6B7280',
  },
  ghost: {
    bg: 'transparent',
    border: '#D1D5DB',
    shadow: 'transparent',
  },
  danger: {
    bg: '#FFF1F2',
    border: '#FDA4AF',
    shadow: '#F43F5E',
  },
}

const IconButton = ({
  icon,
  pulsar,
  color = '#374151',
  enlace,
  label,
  disabled = false,
  variant = 'primary',
  size = 'md',
}: IconButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current
  const shadowOffset = useRef(new Animated.Value(1)).current

  const { icon: iconSize, padding, radius } = SIZES[size]
  const { bg, border, shadow } = VARIANTS[variant]

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(shadowOffset, {
        toValue: 0,
        duration: 80,
        useNativeDriver: false,
      }),
    ]).start()
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }),
      Animated.timing(shadowOffset, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start()
  }

  const borderBottomWidth = shadowOffset.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 4],
  })

  const borderRightWidth = shadowOffset.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  })

  return (
    <Pressable
      onPress={disabled ? undefined : pulsar}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityLabel={label ?? enlace ?? icon}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: bg,
            borderColor: border,
            borderRadius: radius,
            padding,
            borderBottomColor: shadow,
            borderRightColor: shadow,
            borderBottomWidth,
            borderRightWidth,
            transform: [{ scale }],
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={disabled ? '#9CA3AF' : color}
        />
        {label ? (
          <Text
            style={[
              styles.label,
              { fontSize: size === 'sm' ? 10 : size === 'lg' ? 13 : 11 },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  label: {
    marginTop: 4,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
})

export default IconButton