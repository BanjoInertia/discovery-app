import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { setHasSeenOnboarding } from '../../services/storage';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Acervo Pessoal',
        description: 'Todos os seus filmes favoritos ao seu alcance em um só lugar.',
        icon: 'film-outline' as any,
        colors: ['#4c669f', '#3b5998', '#192f6a']
    },
    {
        id: '2',
        title: 'Roleta da Sorte',
        description: 'Não sabe o que assistir? Deixe o acaso decidir qual será seu próximo filme.',
        icon: 'dice-outline' as any,
        colors: ['#ff7e5f', '#feb47b']
    },
    {
        id: '3',
        title: 'Crie sua Reserva',
        description: 'Guarde os filmes que você Quer Assistir para nunca mais esquecê-los.',
        icon: 'bookmark-outline' as any,
        colors: ['#43cea2', '#185a9d']
    }
];

export function Onboarding() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    async function handleFinish() {
        await setHasSeenOnboarding();
        navigation.replace('home');
    }

    function scrollToNext() {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleFinish();
        }
    }

    const Indicator = () => {
        return (
            <View style={styles.indicatorContainer}>
                {SLIDES.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.8, 1.4, 0.8],
                        extrapolate: 'clamp'
                    });
                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.4, 1, 0.4],
                        extrapolate: 'clamp'
                    });
                    return (
                        <Animated.View 
                            key={i.toString()} 
                            style={[styles.dot, { transform: [{ scale }], opacity, backgroundColor: colors.accent }]} 
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.FlatList
                data={SLIDES}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: true
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
                ref={slidesRef}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <LinearGradient colors={item.colors} style={styles.iconContainer}>
                            <Ionicons name={item.icon} size={100} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
                    </View>
                )}
            />
            
            <View style={styles.bottomContainer}>
                <Indicator />
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.accent }]} 
                    activeOpacity={0.8}
                    onPress={scrollToNext}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        paddingHorizontal: 32,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
