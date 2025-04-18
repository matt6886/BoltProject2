import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Image } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useHistoryStore, type HistoryItem } from '../../store/history';
import { useAuthStore } from '../../store/auth';
import { Logo } from '../../components/Logo';
import { ThemeContext } from '../../components/ThemeProvider';
import { t } from '../../utils/i18n';

const getTemperatureColor = (temp: string) => {
  if (temp.toLowerCase().includes('froid')) {
    return '#A3D5FF';
  }
  switch (temp) {
    case '30°C':
      return '#30C0FF';
    case '40°C':
      return '#40C040';
    case '60°C':
      return '#FFA040';
    default:
      return '#757575';
  }
};

const getCycleStyle = (cycle: string) => {
  switch (cycle.toLowerCase()) {
    case 'délicat':
    case 'très délicat':
      return { color: '#40C040', backgroundColor: '#E8F5E9' };
    case 'normal':
      return { color: '#30C0FF', backgroundColor: '#E3F2FD' };
    case 'intensif':
      return { color: '#FFA040', backgroundColor: '#FFF3E0' };
    default:
      return { color: '#757575', backgroundColor: '#F5F5F5' };
  }
};

const formatTemperature = (temp: string) => {
  if (temp.toLowerCase().includes('froid')) {
    return t('history.coldWater');
  }
  return temp;
};

const formatCycle = (cycle: string) => {
  if (cycle.toLowerCase().includes('lavage')) {
    return cycle.split(' ').pop() || cycle;
  }
  return cycle;
};

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const { user } = useAuthStore();
  const historyItems = useHistoryStore(state => state.items);
  const fetchUserHistory = useHistoryStore(state => state.fetchUserHistory);
  const [displayedItems, setDisplayedItems] = useState(historyItems);

  const { theme } = useContext(ThemeContext);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (user) {
      fetchUserHistory(user.uid);
    }
  }, [user, fetchUserHistory]);

  useEffect(() => {
    if (!searchQuery) {
      setDisplayedItems(historyItems);
    } else {
      applySearch(searchQuery);
    }
  }, [historyItems, searchQuery]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleItemPress = useCallback((item: HistoryItem) => {
    if (item.analysisResult) {
      router.push({
        pathname: '/analysis-result',
        params: { itemId: item.id }
      });
    }
  }, [router]);

  const applySearch = useCallback((query: string) => {
    if (!query) {
      setDisplayedItems(historyItems);
      return;
    }
    
    const results = historyItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.cycle.toLowerCase().includes(query.toLowerCase())
    );
    
    setDisplayedItems(results);
  }, [historyItems]);

  const renderItem = useCallback(({ item }: { item: HistoryItem }) => {
    const cycleStyle = getCycleStyle(item.cycle);
    const formattedTemp = formatTemperature(item.temperature);
    const formattedCycle = formatCycle(item.cycle);
    
    return (
      <Pressable
        style={[styles.historyItem, { backgroundColor: theme.card }]}
        onPress={() => handleItemPress(item)}>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemContent}>
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.itemDate, { color: theme.textSecondary }]}>{item.date}</Text>
          <View style={styles.itemDetails}>
            <View
              style={[
                styles.temperatureBadge,
                { backgroundColor: getTemperatureColor(item.temperature) },
              ]}>
              <Text style={styles.temperatureText}>{formattedTemp}</Text>
            </View>
            <View style={[styles.cycleBadge, { backgroundColor: cycleStyle.backgroundColor }]}>
              <Text style={[styles.cycleText, { color: cycleStyle.color }]}>{formattedCycle}</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color={theme.primary} />
      </Pressable>
    );
  }, [handleItemPress, theme]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSecondary, theme.backgroundSecondary]}
        style={styles.gradient}
      />
      
      <Logo />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('history.searchPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t('history.emptyHistory')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  listContainer: {
    padding: 24,
    gap: 16,
    paddingBottom: 100,
  },
  historyItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  itemDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  temperatureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  temperatureText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  cycleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cycleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
});