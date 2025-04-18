import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

type CheckboxProps = {
  checked: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({ checked, onValueChange, disabled }: CheckboxProps) {
  return (
    <Pressable
      style={[
        styles.container,
        checked && styles.checked,
        disabled && styles.disabled
      ]}
      onPress={() => !disabled && onValueChange(!checked)}
      disabled={disabled}>
      {checked && (
        <Check size={14} color="#FFFFFF" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3A8DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#3A8DFF',
    borderColor: '#3A8DFF',
  },
  disabled: {
    opacity: 0.5,
  },
});