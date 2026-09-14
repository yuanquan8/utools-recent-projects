import {Vscode1640ApplicationImpl, VscodeApplicationImpl} from '../../../src/parser/editor/Vscode'
import {Context} from '../../../src/Context'
import {queryFromSqlite} from '../../../src/utils/sqlite/SqliteExecutor'

jest.mock('../../../src/utils/sqlite/SqliteExecutor')

const mockedQueryFromSqlite = queryFromSqlite as jest.MockedFunction<typeof queryFromSqlite>

beforeEach(() => {
    mockedQueryFromSqlite.mockReset()
})

test('vscodeProjectItems', async () => {
    let app = new VscodeApplicationImpl()
    ;(app as any).config = `${__dirname}/storage.json`

    let items = await app.generateProjectItems(Context.get())
    expect(items.length).toEqual(4)
    expect(items[0].title).toEqual('notes')
    expect(items[1].title).toEqual('notes')
    expect(items[2].title).toEqual('notes-server')
    expect(items[3].title).toEqual('notes')
})

test('vscode1640ProjectItemsFromStorageJson', async () => {
    mockedQueryFromSqlite.mockResolvedValue([{
        result: JSON.stringify({
            entries: [{fileUri: 'file:///Users/lanyuanxiaoyao/database-only.md'}],
        }),
    }])
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/vscode-1640/state.vscdb`

    let items = await app.generateProjectItems(Context.get())
    expect(items.length).toEqual(3)
    expect(items[0].title).toEqual('current-project')
    expect(items[1].title).toEqual('sample')
    expect(items[2].title).toEqual('README')
    expect(mockedQueryFromSqlite).not.toHaveBeenCalled()
})

test('vscode1640ProjectItemsFallbackToStateVscdb', async () => {
    mockedQueryFromSqlite.mockResolvedValue([{
        result: JSON.stringify({
            entries: [{fileUri: 'file:///Users/lanyuanxiaoyao/database-only.md'}],
        }),
    }])
    let app = new Vscode1640ApplicationImpl()
    ;(app as any).config = `${__dirname}/vscode-1640-legacy/state.vscdb`

    let items = await app.generateCacheProjectItems(Context.get())
    expect(items.length).toEqual(1)
    expect(items[0].title).toEqual('database-only')
    expect(mockedQueryFromSqlite).toHaveBeenCalledTimes(1)
})
