import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import DatePickerSVG from '../assets/icons/date_picker.svg';

import CustomText from './CustomText';

type DatePickerProps = {
  mode: 'date' | 'datetime';
  defaultValue?: string;
  placeholder: string;
  isError?: boolean;
  errorMessage?: string;
  maximumDateValue?: boolean;
  minimumDateValue?: Date;
  onInputChange?: (value: string) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
  mode,
  defaultValue,
  placeholder,
  isError = false,
  errorMessage,
  maximumDateValue = true,
  minimumDateValue = null,
  onInputChange,
}) => {
  const [value, setValue] = useState(defaultValue ? defaultValue : '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    defaultValue ? new Date(defaultValue) : null,
  );
  const [isVisible, setIsVisible] = useState(false);

  const showDatePicker = () => {
    setIsVisible(true);
  };

  const hideDatePicker = () => {
    setIsVisible(false);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);

    if (mode === 'date') {
      setValue(formatDate(date));
    } else {
      setValue(formatDateTime(date));
    }

    hideDatePicker();
  };

  const handleInputChange = useCallback(
    (value: string) => {
      onInputChange?.(value);
    },
    [onInputChange],
  );

  useEffect(() => {
    handleInputChange(value);
  }, [handleInputChange, value]);

  const formatDate = (date: Date | null) => {
    if (!date) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <View
      style={[
        styles.container,
        isError ? { marginBottom: 30 } : { marginBottom: 15 },
      ]}>
      <Pressable
        style={[styles.input, isError ? styles.error : null]}
        onPress={showDatePicker}>
        {value === '' ? (
          <CustomText size={16} color="#999999" weight="regular">
            {placeholder}
          </CustomText>
        ) : (
          <CustomText size={16} weight="regular">
            {value}
          </CustomText>
        )}
        <DatePickerSVG style={styles.img} />
        <DateTimePickerModal
          isVisible={isVisible}
          mode={mode}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          locale="ko_KR"
          date={selectedDate || new Date()}
          // maximumDate={maximumDateValue ? new Date() : null}
          // minimumDate={minimumDateValue ? minimumDateValue : undefined}
        />
      </Pressable>
      {isError ? (
        <CustomText size={14} weight="regular" color="#FF6D70">
          {errorMessage}
        </CustomText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
  },
  input: {
    position: 'relative',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    height: 50,
  },
  img: {
    position: 'absolute',
    right: 15,
  },
  error: {
    borderColor: '#FF6D70',
  },
});

export default DatePicker;
