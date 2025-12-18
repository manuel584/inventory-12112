import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { ArabicText } from '../constants/ArabicText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import * as SampleQueries from '../database/queries/samples';

type AddSampleRouteProp = RouteProp<RootStackParamList, 'AddSample'>;

export const AddSampleScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddSampleRouteProp>();
    const editId = route.params?.id;

    const [recipientName, setRecipientName] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editId) {
            loadSampleData(editId);
        }
    }, [editId]);

    const loadSampleData = async (id: number) => {
        try {
            setLoading(true);
            const samples = await SampleQueries.getAllSamples();
            const sample = samples.find(s => s.id === id);
            if (sample) {
                setRecipientName(sample.recipient_name);
                setNotes(sample.notes || '');
                navigation.setOptions({ title: 'تعديل عينة' });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('خطأ', 'فشل تحميل بيانات العينة');
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!recipientName.trim()) newErrors.recipientName = 'اسم المستلم مطلوب';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            if (editId) {
                await SampleQueries.updateSample(editId, {
                    recipient_name: recipientName,
                    notes: notes,
                });
                Alert.alert(ArabicText.common.success, 'تم تعديل العينة بنجاح');
            } else {
                await SampleQueries.createSample({
                    recipient_name: recipientName,
                    notes: notes,
                    date_sent: new Date().toISOString(),
                });
                Alert.alert(ArabicText.common.success, 'تم إضافة العينة بنجاح');
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert(ArabicText.common.error, 'حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Input
                    label="اسم المستلم"
                    value={recipientName}
                    onChangeText={setRecipientName}
                    error={errors.recipientName}
                    placeholder="اسم الشخص أو الجهة"
                />

                <Input
                    label="ملاحظات"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="تفاصيل العينة..."
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                />

                <Button
                    title={ArabicText.common.save}
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Layout.spacing.md,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Layout.spacing.lg,
        borderRadius: Layout.borderRadius.lg,
    },
    saveButton: {
        marginTop: Layout.spacing.md,
    },
});
