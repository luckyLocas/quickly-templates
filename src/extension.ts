import * as vscode from 'vscode'

// 定义你的模板内容
const tablePageTemplate = `  
  import './index.less';

  import {
	ModalForm,
	ProFormInstance,
	ProFormTextArea,
  } from '@ant-design/pro-form';
  import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
  import { Button, message, Popconfirm, Space, Tag } from 'antd';
  import React, { memo, useRef } from 'react';
  
  import {
	AddRemarkData,
	DelRemarkData,
	EnableOrDisableRemark,
	GetTableData,
	UpdateRemarkData,
  } from './services';
  
  /**
   * 列表页
   * @returns
   */
  const Index = memo(() => {
	const formRef = useRef<ProFormInstance<{ remark: string }>>();
	const editFormRef = useRef<ProFormInstance<{ remark: string }>>();
	const tableRef = useRef<ActionType>();
  
	const columns: ProColumns<any>[] = [
	  {
		title: '备注内容',
		dataIndex: 'remark',
	  },
	  {
		title: '创建时间',
		dataIndex: 'createTime',
		hideInSearch: true,
		width: 240,
		align: 'center',
	  },
	  {
		title: '状态',
		dataIndex: 'state',
		width: 120,
		hideInSearch: true,
		align: 'center',
		render: (text: any, { isDisable }) => {
		  return (
			<Tag color={isDisable === 0 ? 'blue' : 'red'}>
			  {['启用', '禁用'][isDisable ?? 0]}
			</Tag>
		  );
		},
	  },
	  {
		title: '操作',
		key: 'action',
		fixed: 'right',
		width: 200,
		hideInSearch: true,
		render: (_text, record) => {
		  const { isDisable } = record;
		  return (
			<Space size="middle">
			  <ModalForm
				formRef={editFormRef}
				title="编辑"
				width={600}
				onVisibleChange={(visible: boolean) => {
				  if (!visible) {
					editFormRef.current?.resetFields();
				  } else {
					setTimeout(() => {
					  editFormRef.current?.setFieldsValue({
						remark: record.remark,
					  });
					}, 0);
				  }
				}}
				onFinish={async values => {
				  const res = await UpdateRemarkData({
					...values,
					disable: isDisable,
					id: record.id,
				  });
				  if (res) {
					message.success('修改成功');
					tableRef.current?.reload();
				  }
				  return res;
				}}
				trigger={<Button type="link">编辑</Button>}>
				<ProFormTextArea
				  name="remark"
				  label="备注内容"
				  rules={[{ required: true }]}
				  fieldProps={{
					maxLength: 120,
					placeholder: '最多120个字',
					showCount: true,
				  }}
				/>
			  </ModalForm>
			  {isDisable === 0 ? (
				<Popconfirm
				  title="确定要禁用该备注吗?"
				  onConfirm={async () => {
					const res = await EnableOrDisableRemark({
					  id: record.id,
					  disabledState: 1,
					});
					if (res) {
					  message.success('禁用成功');
					  tableRef.current?.reload();
					}
					return res;
				  }}
				  okText="确认"
				  cancelText="取消">
				  <Button type="link" danger>
					禁用
				  </Button>
				</Popconfirm>
			  ) : (
				<>
				  <Popconfirm
					title="确定要启用该备注吗?"
					onConfirm={async () => {
					  const res = await EnableOrDisableRemark({
						id: record.id,
						disabledState: 0,
					  });
					  if (res) {
						message.success('启用成功');
						tableRef.current?.reload();
					  }
					  return res;
					}}
					okText="确认"
					cancelText="取消">
					<Button type="link">启用</Button>
				  </Popconfirm>
				  <Popconfirm
					title="确定要删除该备注吗?"
					onConfirm={async () => {
					  const res = await DelRemarkData(record.id);
					  if (res) {
						message.success('删除成功');
						tableRef.current?.reload();
					  }
					  return res;
					}}
					okText="确认"
					cancelText="取消">
					<Button type="link" danger>
					  删除
					</Button>
				  </Popconfirm>
				</>
			  )}
			</Space>
		  );
		},
	  },
	];
  
	// 获取table数据
	const reqTableData = async (params: any) => {
	  params.pageNum = params.current;
	  const res = await GetTableData(params);
	  return {
		total: res?.total ?? 0,
		data: res?.list ?? [],
	  };
	};
  
	return (
	  <div className="remarkConfig">
		<div className="pageTitle">备注配置</div>
		<ProTable
		  columns={columns}
		  actionRef={tableRef}
		  rowKey="id"
		  search={false}
		  request={reqTableData}
		  scroll={{
			y: '50vh',
		  }}
		  bordered
		  headerTitle={
			<ModalForm
			  key="add"
			  formRef={formRef}
			  title="新增"
			  width={600}
			  onVisibleChange={(visible: boolean) => {
				if (!visible) formRef.current?.resetFields();
			  }}
			  onFinish={async values => {
				const res = await AddRemarkData(values);
				if (res) {
				  message.success('新增成功');
				  tableRef.current?.reload();
				}
				return res;
			  }}
			  trigger={<Button type="primary"> 新增</Button>}>
			  <ProFormTextArea
				name="remark"
				label="备注内容"
				rules={[{ required: true }]}
				fieldProps={{
				  maxLength: 120,
				  placeholder: '最多120个字',
				  showCount: true,
				}}
			  />
			</ModalForm>
		  }
		/>
	  </div>
	);
  });
  
  export default Index;
  
`

export function activate(context: vscode.ExtensionContext) {
  // 快速生成列表页模板命令
  let createTablePage = vscode.commands.registerCommand(
    'quickly-templates.createTablePage',
    async (params) => {
      console.log('params', params)
      try {
        // 获取当前文件夹路径
        const workspace = params.path
        // 定义新文件的路径和名称
        const newFilePath = vscode.Uri.file(workspace + '/index.tsx')

        // 创建新文件并写入模板内容
        await vscode.workspace.fs.writeFile(
          newFilePath,
          Buffer.from(tablePageTemplate),
        )

        // 显示成功消息
        vscode.window.showInformationMessage('列表页模板创建成功!')
        // 如果需要，可以打开新创建的文件
        vscode.window.showTextDocument(newFilePath)
      } catch (error) {
        // 显示错误消息
        vscode.window.showErrorMessage(`模板创建失败：${error}`)
      }
    },
  )
  context.subscriptions.push(createTablePage)
}

// This method is called when your extension is deactivated
export function deactivate() {}
