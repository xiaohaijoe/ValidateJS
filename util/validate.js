// +----------------------------------------------------------------------
// | Validate
// +----------------------------------------------------------------------
// | Document: https://github.com/xiaohaijoe/TimelineValidate/wiki/TimelineValidate-Document
// +----------------------------------------------------------------------
// | Author: xiaohaijoe <xiaohaijoe@hotmail.com>
// +----------------------------------------------------------------------


let arrayMerge = function (arr1, arr2) {
    if (arr1 == null) {
        arr1 = [];
    }
    if (arr2 == null) {
        arr2 = [];
    }
    for (let key in arr2) {
        arr1[key] = arr2[key];
    }
    return arr1;
};

let inArray = function (search, array) {
    for (let i in array) {
        if (array[i] === search) {
            return true;
        }
    }
    return false;
};

let alias = {
    '>': 'gt',
    '>=': 'egt',
    '<': 'lt',
    '<=': 'elt',
    '=': 'eq',
    'same': 'eq',
};

// 验证规则默认提示信息
let typeMsg = {
    'require': ':attribute不能为空',
    'number': ':attribute必须是数字',
    'float': ':attribute必须是浮点数',
    "integer": ':attribute必须是整数',
    'boolean': ':attribute必须是布尔值',
    'email': ':attribute格式不符',
    'array': ':attribute必须是数组',
    'accepted': ':attribute必须是yes、on或者1',
    'date': ':attribute格式不符合',
    'file': ':attribute不是有效的上传文件',
    'image': ':attribute不是有效的图像文件',
    'alpha': ':attribute只能是字母',
    'alphaNum': ':attribute只能是字母和数字',
    'alphaDash': ':attribute只能是字母、数字和下划线_及破折号-',
    'activeUrl': ':attribute不是有效的域名或者IP',
    'chs': ':attribute只能是汉字',
    'chsAlpha': ':attribute只能是汉字、字母',
    'chsAlphaNum': ':attribute只能是汉字、字母和数字',
    'chsDash': ':attribute只能是汉字、字母、数字和下划线_及破折号-',
    'url': ':attribute不是有效的URL地址',
    'ip': ':attribute不是有效的IP地址',
    'dateFormat': ':attribute必须使用日期格式 :rule',
    'in': ':attribute必须在 :rule 范围内',
    'notIn': ':attribute不能在 :rule 范围内',
    'between': ':attribute只能在 :1 - :2 之间',
    'notBetween': ':attribute不能在 :1 - :2 之间',
    'length': ':attribute长度不符合要求 :rule',
    'max': ':attribute长度不能超过 :rule',
    'min': ':attribute长度不能小于 :rule',
    'after': ':attribute日期不能小于 :rule',
    'before': ':attribute日期不能超过 :rule',
    'expire': '不在有效期内 :rule',
    'allowIp': '不允许的IP访问',
    'denyIp': '禁止的IP访问',
    'confirm': ':attribute和字段 :rule 不一致',
    'different': ':attribute和字段 :rule 不能相同',
    'egt': ':attribute必须大于等于 :rule',
    'gt': ':attribute必须大于 :rule',
    'elt': ':attribute必须小于等于 :rule',
    'lt': ':attribute必须小于 :rule',
    'eq': ':attribute必须等于 :rule',
    'unique': ':attribute已存在',
    'regex': ':attribute不符合指定规则',
    'method': '无效的请求类型',
    'token': '令牌数据无效',
    'fileSize': '上传文件大小不符',
    'fileExt': '上传文件后缀不符',
    'fileMime': '上传文件类型不符',
};

class Validate {
    constructor(rules = [], msg = []) {
        this.rule = rules;
        this.msg = msg;
    }

    /**
     * 添加字段验证规则
     * @access protected
     * @param string|array  $name  字段名称或者规则数组
     * @param mixed         $rule  验证规则
     * @return Validate
     */
    addRule(name, rule = '') {
        if (typeof name === 'object') {
            this.rule = arrayMerge(this.rule, name);
        } else {
            this.rule[name] = rule;
        }
        return this;
    }

    /**
     * 数据自动验证
     * @access public
     * @param array     $data  数据
     * @param mixed     $rules  验证规则
     * @param string    $scene 验证场景
     * @return bool
     */
    check(data, rules = [], scene = '') {
        this.error = [];

        if (Object.keys(rules).length === 0) {
            // 读取验证规则
            rules = this.rule;
        }

        for (let key in rules) {
            let item = rules[key];
            // field => rule1|rule2... field=>['rule1','rule2',...]
            let rule = "";
            let msg = [];
            let k = parseInt(key);
            if (typeof k === 'number') {
                // [field,rule1|rule2,msg1|msg2]
                key = item[0];
                rule = item[1];
                if (item[2] != null) {
                    msg = typeof item[2] === 'string' ? item[2].split('|') : item[2];
                } else {
                    msg = [];
                }
            } else {
                rule = item;
                msg = [];
            }
            let title = "";
            if (key.indexOf('|') > 0) {
                // 字段|描述 用于指定属性名称
                let a = key.split('|');
                key = a[0];
                title = a[1]
            } else {
                title = key;
            }


            // 获取数据 支持二维数组
            let value = Validate.getDataValue(data, key);

            // 字段验证
            let result = this.checkItem(key, value, rule, data, title, msg);

            if (true !== result) {
                this.error[key] = result;
                return false;
            }
        }
        return Object.keys(this.error).length === 0;
    }

    /**
     * 验证单个字段规则
     * @access protected
     * @param string    $field  字段名
     * @param mixed     $value  字段值
     * @param mixed     $rules  验证规则
     * @param array     $data  数据
     * @param string    $title  字段描述
     * @param array     $msg  提示信息
     * @return mixed
     */
    checkItem(field, value, rules, data, title = '', msg = []) {
        // 支持多规则验证 require|in:a,b,c|... 或者 ['require','in'=>'a,b,c',...]
        if (typeof rules === 'string') {
            rules = rules.split('|');
        }
        let i = 0;
        let result = false;
        for (let key in rules) {
            let rule = rules[key];
            // 判断验证类型
            let type = '';
            let info = '';
            let k = parseInt(key)
            if (typeof k === 'number' && typeof rule !== 'function' && rule.toString().indexOf(':') > 0) {
                let a = rule.split(':');
                type = a[0];
                rule = a[1];
                if (alias[type] != null) {
                    // 判断别名
                    type = alias[type];
                }
                info = type;
            } else if (typeof k === 'number') {
                type = 'is';
                info = rule;
            } else {
                info = type = key;
            }

            // 如果不是require 有数据才会行验证
            if (info.toString().indexOf('require') === 0 || (value != null && '' !== value) || typeof rule === 'function') {
                // 验证数据
                let callback = Validate[type];
                result = callback.apply(this, [value, rule, data, field]);

            } else {
                result = true;
            }

            if (false === result) {
                // 验证失败 返回错误信息
                let message = "";
                if (msg[i] != null) {
                    message = msg[i];
                } else {
                    message = this.getRuleMsg(field, title, info, rule);
                }
                return message;
            } else if (true !== result) {
                // 返回自定义错误信息
                return result;
            }
            i++;
        }
        return true !== result ? result : true;
    }

    getErrorByKey(key) {
        if (key == null) {
            for (let k in this.error) {
                return this.error[k];
            }
        }
        return this.error[key]
    }

    getError() {
        return this.error
    }

    /**
     * 获取数据值
     * @access protected
     * @param array     $data  数据
     * @param string    $key  数据标识 支持二维
     * @return mixed
     */
    static getDataValue(data, key) {
        let value = null;
        if (key.indexOf('.') > 0) {
            // 支持二维数组验证
            let a = key.split('.');
            let name1 = a[0];
            let name2 = a[1];
            value = data[name1][name2] != null ? data[name1][name2] : null;
        } else {
            value = data[key] != null ? data[key] : null;
        }
        return value;
    }

    /**
     * 设置提示信息
     * @access public
     * @param string|array  $name  字段名称
     * @param string        $message 提示信息
     * @return Validate
     */
    message(name, message = '') {
        if (Object.keys(name).length > 0) {
            this.msg = arrayMerge(this.msg, name)
        } else {
            this.msg[name] = message;
        }
        return this;
    }

    /**
     * 获取验证规则的错误提示信息
     * @access protected
     * @param string    $attribute  字段英文名
     * @param string    $title  字段描述名
     * @param string    $type  验证规则名称
     * @param mixed     $rule  验证规则数据
     * @return string
     */
    getRuleMsg(attribute, title, type, rule) {
        let msg = '';
        if (this.msg[attribute + '.' + type] != null) {
            msg = this.msg[attribute + '.' + type]
        } else if (this.msg[attribute] != null) {
            msg = this.msg[attribute];
        } else if (null != typeMsg[type]) {
            msg = typeMsg[type];
        } else {
            msg = title + '规则错误';
        }
        // TODO 多语言支持
        if (typeof msg === 'string' && msg.indexOf(':') >= 0) {
            // 变量替换
            let array = ['', '', ''];
            if (rule.indexOf(',') > 0) {
                let a = rule.split(',');
                for (let i in a) {
                    array[i] = a[i];
                }
            }
            msg = msg.replace(':attribute', title);
            msg = msg.replace(':rule', rule.toString());
            msg = msg.replace(':1', array[0]);
            msg = msg.replace(':2', array[1]);
            msg = msg.replace(':3', array[2]);
        }
        return msg;
    }

    /**
     * 验证是否在范围内
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static in(value, rule) {
        return inArray(value.toString(), rule instanceof Array ? rule : rule.split(','));
    }

    /**
     * 验证是否不在某个范围
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static notIn(value, rule) {
        return !inArray(value.toString(), rule instanceof Array ? rule : rule.split(','));
    }

    /**
     * between验证数据
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static between(value, rule) {
        if (typeof rule === 'string') {
            rule = rule.split(',');
        }
        let min = rule[0];
        let max = rule[1];
        return value >= min && value <= max;
    }

    /**
     * 使用notbetween验证数据
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static notBetween(value, rule) {
        if (typeof rule === 'string') {
            rule = rule.split(',');
        }
        let min = rule[0];
        let max = rule[1];
        return value < min || value > max;
    }

    /**
     * 验证数据长度
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static length(value, rule) {
        let length = 0;
        if (value instanceof Array) {
            length = value.length;
        } else {
            length = value.toString().length;
        }

        if (rule.indexOf(',') > 0) {
            // 长度区间
            let a = rule.split(',');
            let min = a[0];
            let max = a[1];
            return length >= min && length <= max;
        } else {
            // 指定长度
            return length === rule;
        }
    }

    /**
     * 验证数据最大长度
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static max(value, rule) {

        let length = 0;
        if (value instanceof Array) {
            length = value.length;
        } else {
            length = value.toString().length;
        }
        return length <= rule;
    }

    /**
     * 验证数据最小长度
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static min(value, rule) {
        let length = 0;
        if (value instanceof Array) {
            length = value.length;
        } else {
            length = value.toString().length;
        }
        return length >= rule;
    }

    /**
     * 验证日期
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static after($value, $rule) {
        return value >= rule;
    }

    /**
     * 验证日期
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static before(value, rule) {
        return value <= rule;
    }

    /**
     * 验证有效期
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static expire(value, rule) {
        if (typeof rule === 'string') {
            rule = rule.split(',');
        }
        let start = rule[0];
        let end = rule[1];
        start = parseInt(start);
        end = parseInt(end);

        let time = new Date().getTime() / 1000;
        return time >= start && time <= end;
    }

    /**
     * 使用正则验证数据
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则 正则规则或者预定义正则名
     * @return boolean
     */
    static regex(value, rule) {
        if (rule instanceof RegExp) {
            return rule.test(value);
        } else {
            let pre = rule.indexOf("/^");
            let last = rule.lastIndexOf("$/");
            if (pre === -1 && last === -1) {
                return new RegExp(rule).test(value);
            } else if (pre >= 0 && last >= 0) {
                let flag = rule.substr(last + 2, rule.length);
                rule = rule.substring(pre + 2, last);
                return new RegExp(rule, flag).test(value);
            }
        }
        return false;
    }

    /**
     * 验证是否和某个字段的值一致
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @param array     $data  数据
     * @return bool
     */
    static confirm(value, rule, data) {
        return Validate.getDataValue(data, rule) == value;
    }

    /**
     * 验证是否和某个字段的值是否不同
     * @access protected
     * @param mixed $value 字段值
     * @param mixed $rule  验证规则
     * @param array $data  数据
     * @return bool
     */
    static different(value, rule, data) {
        return Validate.getDataValue(data, rule) != value;
    }

    /**
     * 验证是否大于等于某个值
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static egt(value, rule) {
        return value >= rule;
    }

    /**
     * 验证是否大于某个值
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static gt(value, rule) {
        return value > rule;
    }

    /**
     * 验证是否小于等于某个值
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static elt(value, rule) {
        return value <= rule;
    }

    /**
     * 验证是否小于某个值
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static lt(value, rule) {
        return value < rule;
    }

    /**
     * 验证是否等于某个值
     * @access protected
     * @param mixed     $value  字段值
     * @param mixed     $rule  验证规则
     * @return bool
     */
    static eq(value, rule) {
        return value == rule;
    }

    /**
     * 验证字段值是否为有效格式
     * @access protected
     * @param mixed     $value  字段值
     * @param string    $rule  验证规则
     * @param array     $data  验证数据
     * @return bool
     */
    static is(value, rule, data = []) {
        let result = false;
        switch (rule) {
            case 'require':
                // 必须
                result = (value != null && '' !== value) || '0' === value;
                break;
            case 'accepted':
                // 接受
                result = inArray(value, ['1', 'on', 'yes']);
                break;
            case 'date' :
                result = Validate.isDate(value);
                break;
            case 'alpha':
                // 只允许字母
                result = /^[A-Za-z]+$/.test(value);
                break;
            case 'alphaNum':
                // 只允许字母和数字
                result = /^[A-Za-z0-9]+$/.test(value);
                break;
            case 'alphaDash':
                // 只允许字母、数字和下划线 破折号
                result = /^[A-Za-z0-9\-\\_]+$/.test(value);
                break;
            case 'chs':
                // 只允许汉字
                result = /^[\u4e00-\u9fa5]+$/u.test(value);
                break;
            case 'chsAlpha':
                // 只允许汉字、字母
                result = /^[\u4e00-\u9fa5a-zA-Z]+$/u.test(value);
                break;
            case 'chsAlphaNum':
                // 只允许汉字、字母和数字
                result = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/u.test(value);
                break;
            case 'chsDash':
                // 只允许汉字、字母、数字和下划线_及破折号-
                result = /^[\u4e00-\u9fa5a-zA-Z0-9\\_\-]+$/u.test(value);
                break;
            case 'float':
                // 是否为float
                result = !isNaN(value) && parseFloat(value) === value;
                break;
            case 'number':
                result = !isNaN(value);
                break;
            case 'integer':
                // 是否为整型
                result = !isNaN(value) && parseInt(value) === value;
                break;
            case 'email':
                // 是否为邮箱地址
                result = /^([a-zA-Z0-9]+[_|\\_|\\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\\_|\\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(value)
                break;
            case 'boolean':
                // 是否为布尔值
                result = inArray(value, [0, 1, true, false]);
                break;
            case 'array':
                // 是否为数组
                result = value instanceof Array;
                break;
            default:
                if (typeof rule === 'function') {
                    // 是否为函数
                    result = rule(value);
                } else {
                    // 正则验证
                    result = Validate.regex(value, rule)
                }
                break;
        }
        return result;
    }

    /**
     * 模仿PHP的strtotime()函数
     * strtotime('2012-07-27 12:43:43') OR strtotime('2012-07-27')
     * @return 时间戳
     */
    static isDate(str) {
        let _arr = str.split(' ');
        let _day = _arr[0].split('-');
        _arr[1] = (_arr[1] == null) ? '0:0:0' : _arr[1];
        let _time = _arr[1].split(':');
        for (let i = _day.length - 1; i >= 0; i--) {
            if (isNaN(parseInt(_day[i]))) {
                return false;
            }
            _day[i] = parseInt(_day[i]);
        }
        for (let i = _time.length - 1; i >= 0; i--) {
            if (isNaN(parseInt(_time[i]))) {
                return false;
            }
            _time[i] = parseInt(_time[i]);
        }
        let _temp = new Date(_day[0], _day[1] - 1, _day[2], _time[0], _time[1], _time[2]);
        let time = _temp.getTime() / 1000;
        if (isNaN(time)) {
            return false
        }
        return true
    }

}

export default Validate