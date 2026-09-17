import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

interface SearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchBar({
  query,
  onChangeQuery,
  onClear,
  placeholder = 'Tìm phòng học, lab, tòa nhà...',
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name="search" size={18} color={THEME.colors.textMuted} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onChangeQuery}
          placeholder={placeholder}
          placeholderTextColor={THEME.colors.textMuted}
          keyboardType="default"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => (onClear ? onClear() : onChangeQuery(''))}
            hitSlop={8}
            style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: THEME.colors.text,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
});
