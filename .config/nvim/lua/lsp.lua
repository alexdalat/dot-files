-- Keybinds --

local wk = require("which-key")

wk.register({
    e = { vim.diagnostic.open_float, 'Open diagnostics' },
}, { prefix = "<leader>", mode = "n", noremap = true, silent = false })

vim.api.nvim_create_autocmd('LspAttach', {
    group = vim.api.nvim_create_augroup('UserLspConfig', {}),
    callback = function(ev)
        wk.register({
            F = { vim.lsp.buf.format, 'Format' },
            a = { vim.lsp.buf.code_action, 'Code action', mode = { 'n', 'v' } },
            k = { vim.lsp.buf.hover, 'Hover' },
            r = { vim.lsp.buf.rename, 'Rename' },
            w = {
                name = "Workspace",
                a = { vim.lsp.buf.add_workspace_folder, 'Add workspace folder' },
                r = { vim.lsp.buf.remove_workspace_folder, 'Remove workspace folder' },
                l = { ":lua vim.api.nvim_echo({{vim.inspect(vim.lsp.buf.list_workspace_folders())}}, false, {})<CR>", 'List workspace folders' },
            },
        }, { prefix = "<leader>", mode = 'n', noremap = true, silent = false, buffer = ev.buf })

        wk.register({
            g = {
                name = "Go to",
                D = { vim.lsp.buf.declaration, 'Declaration' },
                d = { vim.lsp.buf.definition, 'Definition' },
                r = { vim.lsp.buf.references, 'References' },
                i = { vim.lsp.buf.implementation, 'Implementation' },
                t = { vim.lsp.buf.type_definition, 'Type definition' },
                s = { vim.lsp.buf.signature_help, 'Signature help' },
            },
        }, { prefix = "<leader>", mode = { 'n', 'v' }, noremap = true, silent = false, buffer = ev.buf })
    end,
})

-- End keybinds --


require("mason").setup({
    ui = {
        icons = {
            package_installed = "✓",
            package_pending = "➜",
            package_uninstalled = "✗"
        }
    }
})
require("mason-lspconfig").setup({
    automatic_installation = true,
})


local lspconfig = require('lspconfig')
local cmp = require('cmp')


cmp.setup({
    snippet = {
        -- REQUIRED - you must specify a snippet engine
        expand = function(args)
            vim.fn["vsnip#anonymous"](args.body) -- For `vsnip` users.
        end,
    },
    window = {
        completion = cmp.config.window.bordered(),
        documentation = cmp.config.window.bordered(),
    },
    mapping = cmp.mapping.preset.insert({
        ['<C-d>'] = cmp.mapping.scroll_docs(-4),
        ['<C-u>'] = cmp.mapping.scroll_docs(4),
        ['<C-p>'] = cmp.mapping.select_prev_item(),
        ['<C-n>'] = cmp.mapping.select_next_item(),
        ['<C-Space>'] = cmp.mapping.complete(),
        ['<C-c>'] = cmp.mapping.abort(),
        ['<CR>'] = cmp.mapping.confirm({ select = false }), -- Accept currently selected item. Set `select` to `false` to only confirm explicitly selected items.
    }),
    sources = cmp.config.sources({
        { name = 'nvim_lsp' },
        { name = 'vsnip' }, -- For vsnip users.
    }, {
        { name = 'buffer' },
    })
})

-- Use buffer source for `/` and `?` (if you enabled `native_menu`, this won't work anymore).
cmp.setup.cmdline({ '/', '?' }, {
    mapping = cmp.mapping.preset.cmdline(),
    sources = {
        { name = 'buffer' }
    }
})

-- Use cmdline & path source for ':' (if you enabled `native_menu`, this won't work anymore).
cmp.setup.cmdline(':', {
    mapping = cmp.mapping.preset.cmdline(),
    sources = cmp.config.sources({
        { name = 'path' }
    }, {
        { name = 'cmdline' }
    }),
    matching = { disallow_symbol_nonprefix_matching = false }
})



-- LSP Stuff
vim.api.nvim_create_autocmd("LspAttach", {
    callback = function(args)
        local bufnr = args.buf
        local client = vim.lsp.get_client_by_id(args.data.client_id)
        if vim.tbl_contains({ 'null-ls' }, client.name) then -- blacklist lsp
            return
        end
        require("lsp_signature").on_attach({
            -- ... setup options here ...
        }, bufnr)
    end,
})



local capabilities = require('cmp_nvim_lsp').default_capabilities()

-- Automatically setup servers
require('mason-lspconfig').setup_handlers({
    function(server)
        lspconfig[server].setup({
            capabilities = capabilities,
        })
    end,
})

-- Other manually setup servers:
-- Lua
lspconfig.lua_ls.setup {
    capabilities = capabilities,
    settings = {
        Lua = {
            runtime = { -- (most likely LuaJIT in the case of Neovim)
                version = 'LuaJIT',
            },
            diagnostics = {
                globals = { -- Get the language server to recognize the `vim` global
                    'vim',
                    'require'
                },
            },
            workspace = { -- Make the server aware of Neovim runtime files
                library = vim.api.nvim_get_runtime_file("", true),
            },
        },
    },
}

-- C++
lspconfig.clangd.setup {
    capabilities = capabilities,
    cmd = {
        "clangd",
        "--enable-config",
        "--offset-encoding=utf-16",
        "--background-index",
        "--pretty",
        "--j=4",
        "--suggest-missing-includes",
        "--clang-tidy",
        "--fallback-style=Google",
    },
}
