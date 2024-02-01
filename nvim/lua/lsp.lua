
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
