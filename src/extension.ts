import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

// vsce package打包

// 默认的列表页模板内容
let tablePageTemplate = `  
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
  const createTablePage = vscode.commands.registerCommand(
    'quickly-templates.createTablePage',
    async (params) => {
      try {
        // 获取当前文件夹路径
        const workspace = params.path
        // 定义新文件的路径和名称
        const newFilePath = vscode.Uri.file(workspace + '/index.tsx')

        // 获取用户自定义的模板内容
        const mySetting: any = vscode.workspace
          .getConfiguration('myExtension')
          .get('tableTemplate')
        console.log('mySetting', mySetting)

        // 创建新文件并写入模板内容
        await vscode.workspace.fs.writeFile(
          newFilePath,
          Buffer.from(mySetting || tablePageTemplate),
        )

        // 显示成功消息
        vscode.window.showInformationMessage('列表页模板创建成功!')
        // 打开新创建的文件
        vscode.window.showTextDocument(newFilePath)
      } catch (error) {
        // 显示错误消息
        vscode.window.showErrorMessage(`模板创建失败：${error}`)
      }
    },
  )
  context.subscriptions.push(createTablePage)

  // 创建模块文件夹
  const disposable = vscode.commands.registerCommand(
    'quickly-templates.createModuleFolder',
    async (params) => {
      try {
        // 获取用户输入的文件夹名称
        const folderName = await vscode.window.showInputBox({
          placeHolder: '请输入文件夹名称',
        })
        const folderPath = params.path.substring(1)

        if (folderPath) {
          const templateFolderPath = path.join(
            folderPath,
            folderName || 'template',
          )
          fs.mkdirSync(templateFolderPath)
          // 获取用户自定义的模板内容
          const mySetting: any = vscode.workspace
            .getConfiguration('myExtension')
            .get('tableTemplate')

          const indexContent = Buffer.from(mySetting || tablePageTemplate)
          fs.writeFileSync(
            path.join(templateFolderPath, 'index.tsx'),
            indexContent,
          )

          const servicesContent = `// Your default services.ts template content`
          fs.writeFileSync(
            path.join(templateFolderPath, 'services.ts'),
            servicesContent,
          )
          vscode.window.showInformationMessage('模板创建成功!')
        }
      } catch (error) {
        // 显示错误消息
        vscode.window.showErrorMessage(`模板创建失败：${error}`)
      }
    },
  )
  context.subscriptions.push(disposable)

  // 自定义模板内容
  const editTemplateWebview = vscode.commands.registerCommand(
    'quickly-templates.editTemplateWebview',
    function () {
      let panel = vscode.window.createWebviewPanel(
        'editTemplateWebview', // Identifies the type of the webview. Used internally
        '自定义模板内容', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          // 允许在webview中执行js
          enableScripts: true,
        },
      )
      panel.webview.html = `
			<html>
			<body>
				<textarea id="myTextarea" rows="50" cols="100" placeholder='请输入新的模板内容'></textarea>
				<div>
					<button onclick="saveSetting()">设置为列表页模板</button>
				</div>
				<script>
					function saveSetting() {
						const value = document.getElementById('myTextarea').value;
						acquireVsCodeApi().postMessage({
							command: 'editTableTemplate',
							text: value
						});
					}
				</script>
			</body>
			</html>
		`
      panel.webview.onDidReceiveMessage(
        (message) => {
          console.log('message', message)
          switch (message.command) {
            case 'editTableTemplate':
              const config = vscode.workspace.getConfiguration('myExtension')
              config.update(
                'tableTemplate',
                message.text,
                vscode.ConfigurationTarget.Global,
              )
              // 显示成功消息
              vscode.window.showInformationMessage(
                '模板修改成功，请重新生成模板查看效果!',
              )
              return
          }
        },
        undefined,
        context.subscriptions,
      )
    },
  )
  context.subscriptions.push(editTemplateWebview)
}

// 插件被停用时，会调用此方法
export function deactivate() {}
