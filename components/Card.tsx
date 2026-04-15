import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import CustomText from './Text';

interface CardProps {
  title: string;
  description: string;
  style?: ViewStyle;
}

/**
 * Componente Custom Card
 * Permite mostrar un título destacado y un párrafo de descripción.
 */
const Card = ({ title, description, style }: CardProps) => {
  return (
    <View style={[styles.card, style]}>
      {/* Título de la Card */}
      <CustomText variant="subtitle" style={styles.title}>
        {title}
      </CustomText>
      
      {/* Párrafo de texto */}
      <CustomText variant="normal" style={styles.description}>
        {description}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevación para Android
    elevation: 3,
  },
  title: {
    marginBottom: 8,
    color: '#111827', // Gris muy oscuro
    fontSize: 18,
  },
  description: {
    color: '#4B5563', // Gris intermedio para el párrafo
    lineHeight: 22,
  },
});

export default Card;
