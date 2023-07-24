import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import DatePickerSVG from '../assets/icons/date_picker.svg';

import CustomText from './CustomText';

type DatePickerProps = {
  mode: 'date' | 'datetime';
  defaultValue?: string;
  placeholder: string;
  onInputChange?: (value: string) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
  mode,
  defaultValue,
  placeholder,
  onInputChange,
}) => {
  const [value, setValue] = useState(defaultValue ? defaultValue : '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
    <Pressable style={styles.container} onPress={showDatePicker}>
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
        maximumDate={new Date()}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  img: {
    position: 'absolute',
    right: 15,
  },
});

export default DatePicker;
