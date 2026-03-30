import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';

// 1. Extendemos TextProps para que tu componente soporte todas 
// las propiedades nativas (numberOfLines, onPress, etc.)
interface CustomTextProps extends TextProps {
  children: React.ReactNode; // Usar children es más estándar que 'value'
  variant?: "normal" | "title" | "subtitle" | "link";
}

const CustomText = ({ 
  children, 
  variant = "normal", 
  style, // Permitimos pasar estilos extra desde afuera
  ...rest 
}: CustomTextProps) => {
  
  // Combinamos el estilo de la variante con cualquier estilo extra
  return (
    <Text style={[styles[variant], style]} {...rest}>
      {children}
    </Text>
  );
};

export default CustomText;

// 2. Definimos los estilos en un objeto centralizado
const styles = StyleSheet.create({
  normal: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151', // Gris oscuro
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280', // Gris medio
  },
  link: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB', // Azul
    textDecorationLine: 'underline',
  },
});