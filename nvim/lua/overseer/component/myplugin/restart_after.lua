local overseer = require("overseer")
local constants = require("overseer.constants")
local STATUS = constants.STATUS

local function does_task_exist(task_name)
  local os_tasks = overseer.list_tasks({
    recent_first = true,
    filter = function(t)
      return task_name == t.name
    end                             -- function end
  })
  return #os_tasks > 0, os_tasks[1] -- return the first task if it exists
end

return {
  desc = "Link a previous task to run upon successful completion of this task",
  -- Define parameters that can be passed in to the component
  params = {
    -- See :help overseer-params
    tasks = {
      type = "list",
      subtype = {
        type = "string",
      },
      delimiter = ",",

      desc = "A comma-separated list of task names to run",
      validate = function(value)
        if #value == 0 then
          return false
        end
        -- check if it is a valid task name in task list
        return true
      end,
      optional = false,
      default_from_task = false,
    },
  },

  constructor = function(params)
    return {

      ---@param status overseer.Status Can be CANCELED, FAILURE, or SUCCESS
      ---@param result table A result table.
      on_complete = function(self, task, status, result)
        if status == STATUS.SUCCESS then
          for _, task_name in ipairs(params.tasks) do
            local exists, t = does_task_exist(task_name)
            if exists then
              overseer.run_action(t, "restart")
            end
          end
        end
      end,

      ---@param lines string[] The list of lines to render into
      ---@param highlights table[] List of highlights to apply after rendering
      ---@param detail number The detail level of the task. Ranges from 1 to 3.
      render = function(self, task, lines, highlights, detail)
        if detail >= 1 then -- always
          -- List the tasks that will be run as such: "After: task1, task2..."
          -- highlight if task does not exist
          local first = true
          local final_str = ""
          local col_pos = 0
          local row_pos = #lines + 1
          for _, task_name in ipairs(params.tasks) do
            local exists, _ = does_task_exist(task_name)
            if first then
              first = false
              final_str = "After: "
              col_pos = #final_str
            else
              final_str = final_str .. ", "
              col_pos = col_pos + 2
            end
            col_pos = col_pos + #task_name

            if not exists then
              table.insert(highlights, { "OverseerFAILURE", row_pos, col_pos, col_pos + #task_name })
            end

            final_str = final_str .. task_name
          end
          table.insert(lines, final_str)
        end
      end,
    }
  end,
}
