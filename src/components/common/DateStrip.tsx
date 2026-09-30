import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { WEEK_DATES } from '../../constants/mockRooms';
import { THEME } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function labelFor(date: string, index: number): string {
  const [, month, day] = date.split('-');
  if (index === 0) return `Hôm nay ${day}/${month}`;
  if (index === 1) return `Ngày mai ${day}/${month}`;
  const [year, monthNum, dayNum] = date.split('-').map(Number);
  const weekday = WEEKDAY[new Date(year, monthNum - 1, dayNum).getDay()];
  return `${weekday} ${day}/${month}`;
}

interface DateStripProps {
  onSelect?: (date: string) => void;
}

export function DateStrip({ onSelect }: DateStripProps) {
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {WEEK_DATES.map((date, index) => {
        const active = selectedDate === date;
        return (
          <Pressable
            key={date}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => {
              setSelectedDate(date);
              onSelect?.(date);
            }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{labelFor(date, index)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
