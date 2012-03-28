/*global describe:false, it:false, expect:false*/
var b0rked = require('../b0rked');

describe('broken', function () {
	var broken = b0rked.broken;
	it('should complain about missing closing tags', function () {
		expect(broken('<a>')).toEqual('no closing tag for "<a>"');
	});
	it('should complain about misnested (overlapping) tags', function () {
		expect(broken('<a><b></a></b>')).toEqual('got "</a>", expected "</b>"');
	});
	it('should complain about closing superfluous closing tags', function () {
		expect(broken('</a>')).toEqual('closing "</a>", wasn\'t open');
	});
	it('should complain about void tags which aren\'t on the white list', function () {
		expect(broken('<a/>')).toEqual('"<a/>" isn\'t a void tag');
	});
	it('should complain about unbalanced angle brackets', function () {
		expect(broken('<a')).toEqual('unbalanced angle brackets');
	});
	it('should allow empty strings', function () {
		expect(broken('')).toBeUndefined();
	});
	it('should allow white-listed void tags', function () {
		expect(broken('<img/>')).toBeUndefined();
	});
	it('should allow white-listed void tags which weren\'t self-closed', function () {
		expect(broken('<img>')).toBeUndefined();
	});
	it('should complain about closing tags whose tag name is on the void tag white list', function () {
		expect(broken('<img></img>')).toEqual('there shouldn\'t be a closing "</img>" tag');
	});
	it('should allow name-spaced tags', function () {
		expect(broken('<svg:g></svg:g>')).toBeUndefined();
	});
	it('should allow text content', function () {
		expect(broken('<a>hello world</a>')).toBeUndefined();
	});
	it('should allow attributes', function () {
		expect(broken('<a foo="bar"></a>')).toBeUndefined();
	});
	it('should ignore doctypes', function () {
		expect(broken('<!DOCTYPE html>')).toBeUndefined();
		expect(broken('<!doctype html>')).toBeUndefined();
		expect(broken('<!DoCtYpE x>')).toBeUndefined();
		expect(broken('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">')).toBeUndefined();
	});
	it('should emit some message for incomplete doctypes', function () {
		// While the message isn't actually correct, it's good enough since it
		// points in the right direction. An incomplete doctype is super rare
		// anyways.
		expect(broken('<!DOCTYPE>')).toEqual('no closing tag for "<DOCTYPE>"');
	});
	it('should ignore the contents of comments', function () {
		expect(broken('<!-- < -->')).toBeUndefined();
	});
	it('should ignore the contents of script tags', function () {
		expect(broken('<script> < </script>')).toBeUndefined();
		expect(broken('<script type="text/javascript"> < </script>')).toBeUndefined();
	});
	it('should ignore the contents of style tags', function () {
		expect(broken('<style> < </style>')).toBeUndefined();
		expect(broken('<style type="text/css"> < </style>')).toBeUndefined();
	});
	it('should ignore the contents of CDATA sections', function () {
		expect(broken('<![CDATA[ < ]]>')).toBeUndefined();
	});
	it('should complain about tag names which aren\'t completely lowercase', function () {
		expect(broken('<IMG/>')).toEqual('replace "<IMG/>" with "<img/>"');
		expect(broken('<imG/>')).toEqual('replace "<imG/>" with "<img/>"');
		expect(broken('<div></DIV>')).toEqual('replace "</DIV>" with "</div>"');
	});
});

describe('onTheWhiteList', function () {
	var onTheWhiteList = b0rked.onTheWhiteList;

	it('should accept whitelisted void tags', function () {
		expect(onTheWhiteList('img')).toEqual(true);
	});
	it('should reject non-whitelisted tags', function () {
		expect(onTheWhiteList('div')).toEqual(false);
	});
	it('should reject empty strings', function () {
		expect(onTheWhiteList('')).toEqual(false);
	});
});

describe('angleBracketsBalanced', function () {
	var angleBracketsBalanced = b0rked.angleBracketsBalanced;

	it('should accept balanced angle brackets', function () {
		expect(angleBracketsBalanced('<>')).toEqual(true);
	});
	it('should reject unbalanced angle brackets', function () {
		expect(angleBracketsBalanced('<')).toEqual(false);
		expect(angleBracketsBalanced('>')).toEqual(false);
	});
	it('should accept empty strings', function () {
		expect(angleBracketsBalanced('')).toEqual(true);
	});
});

describe('stripRegions', function () {
	var stripRegions = b0rked.stripRegions;

	it('should return the input if the start or end tag wasn\'t found', function () {
		expect(stripRegions('abc', '[', ']')).toEqual('abc');
		expect(stripRegions('abc]', '[', ']')).toEqual('abc]');
		expect(stripRegions('[abc', '[', ']')).toEqual('[abc');
	});

	it('should return an empty string if nothing was outside the specified start and end markers', function () {
		expect(stripRegions('[foo]', '[', ']')).toEqual('');
	});

	it('should remove everything inside the specified start and end markers', function () {
		expect(stripRegions('a[b]c', '[', ']')).toEqual('ac');
		expect(stripRegions('1[[2]]3', '[[', ']]')).toEqual('13');
		expect(stripRegions('a[b]c[d]e', '[', ']')).toEqual('ace');
		expect(stripRegions('aa[bb]cc[dd]ee', '[', ']')).toEqual('aaccee');
	});
});