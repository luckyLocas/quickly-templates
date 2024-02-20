import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import tablePageTemplate from './template/tableTemplate'
import formPageTemplate from './template/formTemplate'
import servicesTemplate from './template/servicesTemplate'

// vsce package打包

/**
 *	创建模板页面公共方法
 * @param filePath 文件创建路径
 * @param type 模板类型
 */
async function createPage(filePath: string, type: 'table' | 'form') {
  try {
    const result = {
      table: {
        fileName: '/index.tsx',
        settingName: 'tableTemplate',
        template: tablePageTemplate,
      },
      form: {
        fileName: '/addOrEdit.tsx',
        settingName: 'formTemplate',
        template: formPageTemplate,
      },
    }
    const current = result[type]
    // 定义新文件的路径和名称
    const newFilePath = vscode.Uri.file(filePath + current.fileName)

    // 获取用户自定义的模板内容
    const mySetting: any = vscode.workspace
      .getConfiguration('myExtension')
      .get(current.settingName)
    console.log('mySetting', mySetting)

    // 创建新文件并写入模板内容
    await vscode.workspace.fs.writeFile(
      newFilePath,
      Buffer.from(mySetting || current.template),
    )

    // 显示成功消息
    vscode.window.showInformationMessage('模板创建成功!')
    // 打开新创建的文件
    vscode.window.showTextDocument(newFilePath)
  } catch (error) {
    // 显示错误消息
    vscode.window.showErrorMessage(`模板创建失败：${error}`)
  }
}

export function activate(context: vscode.ExtensionContext) {
  // 快速生成列表页模板命令
  const createTablePage = vscode.commands.registerCommand(
    'quickly-templates.createTablePage',
    async (params) => {
      createPage(params.path, 'table')
    },
  )
  context.subscriptions.push(createTablePage)

  // 快速生成表单页模板命令
  const createFormPage = vscode.commands.registerCommand(
    'quickly-templates.createFormPage',
    async (params) => {
      createPage(params.path, 'form')
    },
  )
  context.subscriptions.push(createFormPage)

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

          const servicesContent = Buffer.from(servicesTemplate)
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
					<button onclick="saveSetting('tableTemplate')">设置为列表页模板</button>
					<button onclick="saveSetting('formTemplate')">设置为表单页模板</button>
				</div>
				<script>
					function saveSetting(type) {
						const value = document.getElementById('myTextarea').value;
						acquireVsCodeApi().postMessage({
							command: type,
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
          const config = vscode.workspace.getConfiguration('myExtension')
          config.update(
            message.command,
            message.text,
            vscode.ConfigurationTarget.Global,
          )
          // 显示成功消息
          vscode.window.showInformationMessage(
            '模板修改成功，请重新生成模板查看效果!',
          )
          panel.dispose()
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
