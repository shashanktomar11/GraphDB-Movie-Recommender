import lex
import yacc

# -----------------------------------------------------------------------------
# calc.py
#
# A simple calculator with variables.   This is from O'Reilly's
# "Lex and Yacc", p. 63.
# -----------------------------------------------------------------------------

import sys
sys.path.insert(0, "../..")

# Tokens

# t_GRT_THAN = r'greater than' # use \s
# t_IT_IS_NOT_TRUE_THAT = r'it is not true that'
# t_IF = r'if'
# t_NOT = r'not'
# t_AND = r'and'
# t_OR = r'or'
# t_IS = r'is'
# t_IN = r'in'
# t_A = r'a'
# t_NAME = r'[a-zA-Z_-]+'

reserved = {
    'if' : 'IF',
    'not' : 'NOT',
    'and' : 'AND',
    'or' : 'OR',
    'it' : 'IT',
    'is' : 'IS',
    'in' : 'IN',
    'a' : 'A',
    'an' : 'AN',
    'the' : 'THE',
    's' : 'S',
    'true' : 'TRUE',
    'that' : 'THAT',
    }
 
tokens = list(reserved.values()) + [ 'NUMBER', 'FLOAT', 'NAME']#,'POSSESIVE']

literals = ['(', ')',',']
# tokens = ['LPAREN','RPAREN',...,'ID'] + list(reserved.values())

def t_NAME(t):
    r'[a-zA-Z_-]+'
    t.type = reserved.get(t.value,'NAME')    # Check for reserved words
    return t

# def t_POSSESIVE(t):
#     r"[a-zA-Z_-]'s"
#     return t

def t_NUMBER(t):
    r'\d+'
    t.value = int(t.value)
    return t

def t_FLOAT(t):
    r'[+-]?([0-9]*[.])?[0-9]+'
    t.value = float(t.value)
    return t

t_ignore = " \t"

def t_newline(t):
    r'\n+'
    t.lexer.lineno += t.value.count("\n")

def t_error(t):
    print("Illegal character '%s'" % t.value[0])
    t.lexer.skip(1)

lexer = lex.lex()

# Parsing rules

# dictionary of names
conditions = {}

def p_statement_simple_assign(p):
    'statement : var IS article var'
    if p[1] in conditions:
        conditions[p[1]].append(p[4])
    else:
        conditions[p[1]]=[p[4]]

def p_statement_possessive_simple_assign(p):
    "statement : NAME S var IS article var"
    if (p[1],p[3]) in conditions:
        conditions[(p[1],p[3])].append(p[6])
    else:
        conditions[(p[1],p[3])]=[p[6]]

def p_statement_not_assign(p):
    'statement : var IS NOT article var'
    if p[1] in conditions:
        conditions[p[1]].append("~"+p[5])
    else:
        conditions[p[1]]=["~"+p[5]]

def p_statement_possessive_not_assign(p):
    "statement : NAME S var IS NOT article var"
    if (p[1],p[3]) in conditions:
        conditions[(p[1],p[3])].append("~"+p[7])
    else:
        conditions[(p[1],p[3])]=["~"+p[7]]


def p_statement_is_not_true_assign(p):
    "statement : IT IS NOT TRUE THAT var IS article var"
    if p[6] in conditions:
        conditions[p[6]].append("~"+p[9])
    else:
        conditions[p[6]]=["~"+p[9]]

def p_statement_possessive_is_not_true_assign(p):
    "statement : IT IS NOT TRUE THAT var S var IS article var"
    if (p[6],p[8]) in conditions:
        conditions[(p[6],p[8])].append(p[11])
    else:
        conditions[(p[6],p[8])]=[p[11]]

def p_statement_and(p):
    'statement : statement AND statement'

def p_var_base(p):
    'var : NAME'
    p[0] = p[1]

def p_var_resursive(p):
    'var : var NAME'
    p[0] = p[1] + " " + p[2]

def p_article(p):
    'article : '

def p_article_a(p):
    'article : A'

def p_article_an(p):
    'article : AN'

def p_article_the(p):
    'article : THE'


# def p_expression_group(p):
#     "expression : '(' expression ')'"
#     p[0] = p[2]


# def p_expression_number(p):
#     "expression : NUMBER"
#     p[0] = p[1]


def p_error(p):
    if p:
        print("Syntax error at '%s'" % p.value)
    else:
        print("Syntax error at EOF")

parser = yacc.yacc()

s = "Account is Advisory and Account is Fee-based and Product's Exchange is NASDAQ and it is not true that Account is PMM"
s.replace("'"," ")
yacc.parse(s)
print(conditions)
# while True:
    # try:
    #     s = input('calc > ')
    # except EOFError:
    #     break
    # if not s:
    #     continue
    # yacc.parse(s)
    # print(names)
