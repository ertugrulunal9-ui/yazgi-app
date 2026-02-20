import React, { useMemo } from 'react';
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
    const isLightTheme = useMemo(() => {
        const match = /^#([0-9a-fA-F]{6})$/.exec(theme.appBg || '');
        if (!match) return false;
        const hex = match[1];
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance >= 0.6;
    }, [theme.appBg]);
    const titleTypography = useMemo(() => ({
        fontSize: isLightTheme ? 13 : 14,
        fontWeight: isLightTheme ? '600' as const : '700' as const,
        letterSpacing: isLightTheme ? 0 : 0.1,
    }), [isLightTheme]);
    const sectionTitleTypography = useMemo(() => ({
        fontSize: isLightTheme ? 17 : 18,
        fontWeight: isLightTheme ? '600' as const : '700' as const,
        letterSpacing: isLightTheme ? 0 : 0.1,
    }), [isLightTheme]);

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, sectionTitleTypography, { color: theme.textPrimary }]}>
                {t('game.whatDoYouWant', undefined, 'Ne yapmak istersin?')}
            </Text>

            <View style={styles.grid}>
                {categories.map((category, index) => {
                    const baseColor = category.color || theme.textPrimary;
                    const cardBackground = isLightTheme
                        ? theme.surfaceRaised
                        : category.bgColor || theme.surfaceBase;
                    const cardBorder = isLightTheme ? `${baseColor}4d` : baseColor;
                    const iconBg = isLightTheme ? `${baseColor}1f` : `${baseColor}33`;
                    const titleColor = isLightTheme ? theme.textPrimary : baseColor;

                    return (
                        <View key={category.id} style={styles.cardWrapper}>
                            <FadeInUpView delay={index * 50}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionCard,
                                        {
                                            backgroundColor: cardBackground,
                                            borderColor: cardBorder,
                                        }
                                    ]}
                                    onPress={() => onCategoryPress(category)}
                                    activeOpacity={0.84}
                                    accessibilityRole="button"
                                    accessibilityLabel={category.title}
                                    accessibilityHint={`${category.subActions.length} farkli aksiyon icerir`}
                                >
                                    <View style={styles.cardContent}>
                                        <View style={[styles.iconShell, { backgroundColor: iconBg }]}>
                                            <MaterialCommunityIcons
                                                name={getCategoryIconName(category.id)}
                                                size={30}
                                                color={baseColor}
                                            />
                                        </View>
                                        <Text style={[styles.title, titleTypography, { color: titleColor }]}>
                                            {category.title}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </FadeInUpView>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    cardWrapper: {
        width: '48%',
        minHeight: 102,
    },
    actionCard: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1.5,
        overflow: 'hidden',
        minHeight: 102,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    iconShell: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 9,
    },
    title: {
        textAlign: 'center',
    },
});
