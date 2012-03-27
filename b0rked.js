/*jslint plusplus:false, regexp:false*/
/*global exports:false, module:false, window:false*/

(function () {
	var grabTagName = /[\w:]+/,
		isClosingTag = /^<\//,
		isVoidTag = /\/>$/,
		isDoctype = /^<!doctype\s+[^>]+>$/i,
		grabTags = /<[^>]+>/g,
		// http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
		voidTagNames = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
			'img', 'input', 'keygen', 'link', 'meta', 'param', 'source',
			'track', 'wbr'],
		onTheWhiteList,
		angleBracketsBalanced,
		stripRegions,
		broken;

	onTheWhiteList = function (tagName) {
		var i;
		for (i = voidTagNames.length; i--;) {
			if (voidTagNames[i] === tagName) {
				break;
			}
		}
		if (i === -1) {
			return false;
		}
		return true;
	};

	angleBracketsBalanced = function (markup) {
		var balance = 0, i;
		for (i = markup.length; i--;) {
			if (markup.charAt(i) === '<') {
				balance++;
			} else if (markup.charAt(i) === '>') {
				balance--;
			}
		}
		if (balance) {
			return false;
		}
		return true;
	};

	stripRegions = function (text, startMarker, endMarker) {
		var from, to, stripped = '', lastEnd = 0;
		from = text.indexOf(startMarker);
		if (from === -1) {
			return text;
		}
		to = text.indexOf(endMarker);
		while (from !== -1 && to !== -1) {
			stripped += text.slice(lastEnd, from);
			to = text.indexOf(endMarker, from);
			from = text.indexOf(startMarker, to);
			lastEnd = to + endMarker.length;
		}
		stripped += text.slice(lastEnd, text.length);
		return stripped;
	};

	broken = function (markup) {
		var stack = [],
			i,
			len,
			tag,
			tags,
			tagName,
			popped;

		// remove all non-markup regions
		markup = stripRegions(markup, '<script', '</script>');
		markup = stripRegions(markup, '<style', '</style>');
		markup = stripRegions(markup, '<![CDATA[', ']]>');
		markup = stripRegions(markup, '<!--', '-->');

		tags = markup.match(grabTags);

		if (tags) {
			for (i = 0, len = tags.length; i < len; i++) {
				tag = tags[i];
				tagName = tag.match(grabTagName)[0];

				if (isClosingTag.test(tag)) {
					// illegal closing tag for void tag
					if (onTheWhiteList(tagName)) {
						return 'there shouldn\'t be a closing "</' + tagName + '>" tag';
					}
					if (stack.length) {
						popped = stack.pop();
						// closing tag doesn't match previously opened tag
						if (tagName !== popped) {
							return 'got "</' + tagName + '>", expected "</' +
								popped + '>"';
						}
					} else {
						// empty stack, superfluous closing tag
						return 'closing "</' + tagName + '>", wasn\'t open';
					}
				} else if (isVoidTag.test(tag)) {
					// check if tag is on the void tag white list
					if (!onTheWhiteList(tagName)) {
						return '"<' + tagName + '/>" isn\'t a void tag';
					}
				} else {
					// opening tag
					if (!onTheWhiteList(tagName) && !isDoctype.test(tag)) {
						stack.push(tagName);
					}
				}
			}
			if (stack.length) {
				// closing tag missing
				return 'no closing tag for "<' + stack.pop() + '>"';
			}
		}

		// count angle brackets
		if (!angleBracketsBalanced(markup)) {
			return 'unbalanced angle brackets';
		}

		return undefined;
	};

	if (typeof module === 'object' && module.exports) {
		exports.broken = broken;
		exports.onTheWhiteList = onTheWhiteList;
		exports.angleBracketsBalanced = angleBracketsBalanced;
		exports.stripRegions = stripRegions;
	} else {
		window.b0rked = broken;
	}
}());