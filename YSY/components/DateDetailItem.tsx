import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Table, TableWrapper, Rows, Col } from 'react-native-table-component';

import { Date } from '../types/date';

type DateDetailItemProps = {
  item: Date;
};

type Data = {
  tableTitle: string[];
  tableData: string[][];
};

export const DateDetailItem: React.FC<DateDetailItemProps> = ({ item }) => {
  const [data, setData] = useState<Data>();

  const init = useCallback(() => {
    const data: Data = {
      tableTitle: [],
      tableData: [],
    };

    if (item.signatureDish) {
      data.tableTitle.push('메인요리');
      data.tableData.push([item.signatureDish]);
    }
    if (item.restDate) {
      data.tableTitle.push('휴무');
      data.tableData.push([item.restDate]);
    }
    if (item.parking) {
      data.tableTitle.push('주차장');
      data.tableData.push([item.parking]);
    }
    if (item.smoking) {
      data.tableTitle.push('흡연');
      data.tableData.push([item.smoking]);
    }
    if (item.babyCarriage) {
      data.tableTitle.push('유모차');
      data.tableData.push([item.babyCarriage]);
    }
    if (item.pet) {
      data.tableTitle.push('애완동물');
      data.tableData.push([item.pet]);
    }
    if (item.kidsFacility) {
      data.tableTitle.push('놀이방');
      data.tableData.push([item.kidsFacility]);
    }

    setData(data);
  }, [item]);

  useEffect(() => {
    init();
  }, [init, item]);

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        {data && (
          <TableWrapper style={styles.wrapper}>
            <Col
              data={data.tableTitle}
              style={styles.title}
              heightArr={[28, 28]}
              textStyle={styles.text}
            />
            <Rows
              data={data.tableData}
              flexArr={[2, 1]}
              style={styles.row}
              // styles.text를 하면 경고메시지 발생 (라이브러리 버그)
              textStyle={{ textAlign: 'center' }}
            />
          </TableWrapper>
        )}
      </Table>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    flexDirection: 'row',
  },
  title: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  row: {
    height: 28,
  },
  text: {
    color: '#222222',
    textAlign: 'center',
  },
});
