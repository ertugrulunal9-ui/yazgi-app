import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FadeInUpView } from '../animations';
import { useUI } from '../context/UIContext';
import { ActionCategory } from '../data/actions';

interface ActionGridProps {
    categories: ActionCategory[];
    onCategoryPress: (category: ActionCategory) => void;
}

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CATEGORY_ICON_MAP: Record<string, MaterialIconName> = {
    baby: 'baby-face-outline',
    explore: 'compass-outline',
    family: 'account-group-outline',
    study: 'book-education-outline',
    sports: 'soccer',
    arts: 'palette-outline',
    computer: 'laptop',
    work: 'briefcase-outline',
    shopping: 'cart-outline',
};

const getCategoryIconName = (categoryId: string): MaterialIconName => {
    return CATEGORY_ICON_MAP[categoryId] || 'star-four-points-outline';
};

export const ActionGrid: React.FC<ActionGridProps> = ({
    categories,
    onCategoryPress,
}) => {
    const { theme, t } = useUI();

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {t('game.whatDoYouWant', undefined, 'Ne yapmak istersin?')}
            </Text>

            <View style={styles.grid}>
                {categories.map((category, index) => (
                    <View key={category.id} style={styles.cardWrapper}>
                        <FadeInUpView delay={index * 50}>
                            <TouchableOpacity
                                style={[
                                    styles.actionCard,
                                    {
                                        backgroundColor: category.bgColor || theme.surfaceBase,
                                        borderColor: category.color || theme.border
                                    }
                                ]}
                                onPress={() => onCategoryPress(category)}
                                activeOpacity={0.8}
                                accessibilityRole="button"
                                accessibilityLabel={category.title}
                                accessibilityHint={`${category.subActions.length} farkli aksiyon icerir`}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.icon}>
                                        <MaterialCommunityIcons
                                            name={getCategoryIconName(category.id)}
                                            size={38}
                                            color={category.color || theme.textPrimary}
                                        />
                                    </View>
                                    <Text style={[styles.title, { color: category.color || theme.textPrimary }]}>
                                        {category.title}
                                    </Text>
                                </View>

                                {/* Subtle Gradient Border Effect */}
                                <View style={[styles.borderGlow, { borderColor: category.color + '40' }]} />
                            </TouchableOpacity>
                        </FadeInUpView>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    cardWrapper: {
        width: '48%',
        minHeight: 110,
    },
    actionCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 2,
        overflow: 'hidden',
        minHeight: 110,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    glowOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 12,
    },
    icon: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    borderGlow: {
        position: 'absolute',
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        borderRadius: 16,
        borderWidth: 1,
        pointerEvents: 'none',
    },
});
