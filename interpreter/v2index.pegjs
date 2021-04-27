{
	function Tree(head, tail){
      return tail.reduce(function(result, element){
          return {
          	  type: "operation",
              left: result,
              operator: element[0],
              right: element[1],
          }
      }, head)
    }
    function JoinString(arr){
    	return {type:"string",value:arr.join("")}
    }
    function Word(w){
    	return {type:"word",value:w}
    }
     function Variable(w){
    	return {type:"variable",value:w}
    }
     function Argument(w){
    	return {type:"argument",value:w}
    }
    function NamedArgument(v,a){
    	return {
        	type:"named",
            name: v,
            arg: a,
        }
    }
    function Assignment(v,s){
    	return {type:"assignment", variable:v,statement:s}
    }
    function Command(name,args){
    	return {
        	name: name,
            args: args,
            type:"command"
        }
    }
    function Instructions(head,tail){
    	if (head) {tail.unshift(head)}
         tail = tail.filter(e=>e.type!="comment")
    	return {
        	type: "instruction",
            value: tail,
        }
    }
    function WrappedInstructions(head,tail){
    	if (head) {tail.unshift(head)}
        tail = tail.filter(e=>e.type!="comment")
    	return {
        	type: "wrappedinstruction",
            value: tail,
        }
    }
}

//ambiguity, brackets won't be able to have statements
// a = {ea} //could be interpreted as a command and as a statement (literal)
//solution: return "command"

Instructions "Instructions" = head: Base? tail:([;\n]?[ \n]* v:Base {return v})* [\n;]* {
	return Instructions(head,tail)
}

WrappedInstructions "Instructions" = head: Base? tail:([\n;]+ v:Base {return v})* [\n;]* {
	return WrappedInstructions(head,tail)
}


MultiLineComment = "/*" value:(!"*/" .)* "*/" {return value}

Comment = value:(MultiLineComment / $("//" [^\n]*)) {return {type:"comment",value:value}};

Base =  Assignment / Command / Comment

Statement = List

NamedArgument "NamedArgument" = variable:Keyword Space "=" Space arg:(Statement / WrappedBrackets / Brackets / Parentheses) {
	return NamedArgument(variable,arg)
}


Command "Command" = head:Keyword tail:((":" Space chars:[^\n]* {return JoinString(chars);}) / (Space value:(NamedArgument / Statement / WrappedBrackets / Brackets / Parentheses){return value}))* {
    return Command(head,tail)
}

Assignment "Assignment" = variable:Keyword Space "=" Space statement:(WrappedBrackets / Statement / Brackets) {
	return Assignment(variable,statement)
}

List "List" = (head:Additive tail:(ListOp Additive)+ {
	var l = [head];
	tail.forEach(function(e){
    	l.push(e[1])
    })
    return {
    	type:"list",
        value:l,
    };
}) / (ListOp value:Additive {return {type:"list", value:value}}) / Additive

Additive = head:Multiplicative tail:(AdditiveOperator Multiplicative)* {
	return Tree(head, tail)
}

Multiplicative = head:ConcatStatement tail:(MultiplicativeOperator ConcatStatement)* {
	return Tree(head, tail)
}

ConcatStatement = head:Transform tail:(ConcatOp Transform)* {
	return Tree(head, tail)
}

Transform = head:Parentheses tail:(TransformOp Parentheses)* {
	return Tree(head, tail)
}

WrappedBrackets = "@{" WhiteSpace statement:(WrappedInstructions)? WhiteSpace "}"{
	return statement;
}

Brackets = (WhiteSpace "{" WhiteSpace statement:(Instructions)? WhiteSpace "}" {
	return statement;
}) / Literal

Parentheses = (WhiteSpace "(" WhiteSpace statement:Statement WhiteSpace ")" WhiteSpace {
	return statement;
}) / Literal / Brackets / WrappedBrackets

//>> transform argument into command
//
TransformOp =  ">>*" / ">>"

ListOp = ","

ConcatOp = ".."

MultiplicativeOperator =
    "*" / "/"

AdditiveOperator = 
	"+" / "-"

Literal "Literal" = Space value:(Variable / Argument / String / Word) Space {return value}
Variable "Variable" = "$" word:Keyword {return Variable(word)}
Argument "Assignment" = "&" word:Keyword {return Argument(word)}

//Number = $([0-9]+)

//Double = $(Number "." Number)

Space "Space" = ([\t ])*

String "String" = QuotationMark chars:Char* QuotationMark {return JoinString(chars);}

Keyword "Keyword" = $(UnquotedChar+);
Word "Word" = word:Keyword {return Word(word)}

UnquotedChar "UnquotedChar" = [^:\0-\x1F\x22\x5C\t \n\(\)\{\}=\+\-\*\/\.\;\,#@,"~",>] / "." [^.] / "@" [^{]

Char "Char"
  = Unescaped
  / EscapeChar
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "{" / "}" / ")" / "("
    )
    { return sequence; }

EscapeChar
  = "\\"

QuotationMark
  = '"'

Unescaped
  = [^\0-\x1F\x22\x5C]
  
WhiteSpace "whitespace" = [ \t\n\r]*