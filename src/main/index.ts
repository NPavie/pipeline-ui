import {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    MenuItemConstructorOptions,
    shell,
    nativeTheme,
} from 'electron'

import { error } from 'electron-log'

import {
    bindWindowToPipeline,
    makeAppSetup,
    makeAppWithSingleInstanceLock,
} from './factories'

import {
    MainWindow,
    PipelineTray,
    registerAboutWindowCreationByIPC,
    registerSettingsWindowCreationByIPC,
} from './windows'

import { buildMenuTemplate } from './menu'

import { registerStoreIPC, store } from './data/store'
import { setupFileDialogEvents } from './fileDialogs'
import { ENVIRONMENT, IPC } from 'shared/constants'
import { setupShowInFolderEvents } from './folder'
import { registerFileIPC } from './factories/ipcs/file'
import { setupFileSystemEvents } from './fileSystem'
import { setupOpenInBrowserEvents } from './browser'
import { APP_CONFIG } from '~/app.config'
import { getPipelineInstance } from './data/middlewares/pipeline'
import { selectColorScheme, selectSettings } from 'shared/data/slices/settings'
import {
    addJob,
    editJob,
    newJob,
    runJob,
    removeJob,
    pipeline,
    selectJob,
    selectPipeline,
    selectJobs,
    selectNextJob,
    selectPrevJob,
} from 'shared/data/slices/pipeline'

makeAppWithSingleInstanceLock(async () => {
    app.setName(APP_CONFIG.TITLE)
    await app.whenReady()
    registerStoreIPC()
    // load theme from settings
    nativeTheme.themeSource = selectColorScheme(store.getState())

    // Windows
    let mainWindow = await makeAppSetup(MainWindow)

    registerSettingsWindowCreationByIPC()
    registerAboutWindowCreationByIPC()
    registerFileIPC()

    // Pipeline instance creation
    // IPC is managed by the store
    const pipelineInstance = getPipelineInstance(store.getState())
    pipelineInstance.launch()

    let tray: PipelineTray = null
    try {
        tray = new PipelineTray(mainWindow)
    } catch (err) {
        error(err)
        // quit app for now but we might need to think for a better handling for the user
        app.quit()
    }
    setupFileDialogEvents()
    setupShowInFolderEvents()
    setupOpenInBrowserEvents()
    setupFileSystemEvents()
    buildMenu(mainWindow, pipelineInstance)

    store.subscribe(() => {
        buildMenu(mainWindow, pipelineInstance)
    })
    // Reopen the main window when trying to launch
    // the app when it is already launched
    app.on(
        'second-instance',
        (event, commandLine, workingDirectory, additionalData) => {
            MainWindow().then((window) => {
                if (window.isMinimized()) {
                    window.restore()
                }
                window.focus()
            })
        }
    )
})

function buildMenu(mainWindow, pipelineInstance) {
    let jobs = selectPipeline(store.getState()).jobs

    //@ts-ignore
    let template = buildMenuTemplate({
        appName: app.name,
        jobs,
        selectedJobId: selectPipeline(store.getState()).selectedJobId,
        onCreateJob: async () => {
            const job = newJob(selectPipeline(store.getState()))
            store.dispatch(addJob(job))
            store.dispatch(selectJob(job))
            try {
                mainWindow.show()
            } catch (error) {
                mainWindow = await MainWindow()
                bindWindowToPipeline(mainWindow, pipelineInstance)
            }
        },
        onShowSettings: async () => {
            // Open the settings window
            ipcMain.emit(IPC.WINDOWS.SETTINGS.CREATE)
        },
        onLearnMore: async () => {
            await shell.openExternal('https://daisy.github.io/pipeline/')
        },
        onUserGuide: async () => {
            await shell.openExternal(
                'https://daisy.github.io/pipeline/Get-Help/'
            )
        },
        onNextTab: async () => {
            store.dispatch(selectNextJob())
        },
        onPrevTab: async () => {
            store.dispatch(selectPrevJob())
        },
        onGotoTab: async (job) => {
            store.dispatch(selectJob(job))
        },
        onRunJob: async (job) => {
            store.dispatch(
                runJob({
                    ...job,
                })
            )
        },
        onRemoveJob: async (job) => {
            store.dispatch(removeJob(job))
        },
        onEditJob: async (job) => {
            store.dispatch(editJob(job))
        },
    })
    // @ts-ignore
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}
