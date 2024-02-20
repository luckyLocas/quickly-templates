// 默认的列表页模板内容
const tablePageTemplate = `  
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { CProTable } from '@jad/components';
import CButton from '@src/bizComponents/cButton';
import PageContent from '@src/components/pageContent';
import { message, Popconfirm } from 'antd';
import React, { memo, useRef } from 'react';

import AddOrEdit from './component/addOrEdit';
import { DeleteWarehouse, GetTableData } from './services';

/**
 * 列表页
 */
const Index = memo(() => {
  const tableRef = useRef<ActionType>();

  const columns: ProColumns<any>[] = [
    { title: '序号', valueType: 'index', width: 60 },
    {
      title: '库房名称',
      dataIndex: 'wareHouseName',
      width: 160,
      hideInSearch: true,
    },
    {
      title: '库房位置',
      dataIndex: 'wareHouseLocaltion',
      width: 200,
      hideInSearch: true,
    },
    { title: '备注', dataIndex: 'remark', hideInSearch: true },
    {
      title: '操作',
      width: 340,
      fixed: 'right',
      hideInSearch: true,
      render: (_text: any, record: any) => {
        return (
          <>
            <AddOrEdit
              key="edit"
              type="edit"
              record={record}
              refresh={() => {
                tableRef.current?.reload();
              }}
            />
            <Popconfirm
              key="delete"
              title="确认删除该库房吗？"
              onConfirm={async () => {
                const res = await DeleteWarehouse({ id: record.id });
                if (res) {
                  message.success('删除成功');
                  tableRef.current?.reload();
                }
              }}>
              <CButton type="link" danger>
                删除
              </CButton>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  return (
    <PageContent title="列表页">
      <CProTable
        columns={columns}
        headerTitle={
          <AddOrEdit
            type="add"
            key="add"
            refresh={() => {
              tableRef.current?.reload();
            }}
          />
        }
        rowKey="id"
        bordered
        scroll={{
          y: '46vh',
        }}
        actionRef={tableRef}
        request={async params => {
          const rp = await GetTableData({
            ...params,
            pageNum: params.current,
          });
          return rp;
        }}
      />
    </PageContent>
  );
});
export default Index;
`

export default tablePageTemplate
