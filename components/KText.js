import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  defaultFontFamily: {
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'Roboto',
  },
});

const KText = ({ children, style, ...props }) => (
  <Text style={[styles.defaultFontFamily, style]} {...props}>
    {children}
  </Text>
);

export default KText;