"use strict";

const verbose = false;
const printExamples = false; // search "rule.name ===" and mention the rule number
const fs = require("fs");
// const test = require('node:test');
const assert = require('assert');
const winkNLP = require("wink-nlp");
const model = require("../../node_modules/wink-eng-lite-web-model/dist/model.js");
const nlp = winkNLP(model);
const its = nlp.its;

const customPatterns = [
  { name: "NOUN", patterns: ["[set|sets|map|maps|integer|integers]"] },
  { name: "VERB", patterns: ["[forms|form]"] },
  {
    name: "ADJ",
    patterns: [
      "[ordered|fixed|equivalence|equivalent|identity|onto|reflexive|even]",
    ]
  },
  {
    name: "PRON",
    patterns: [ "[such|case]" ] },
  { name: 'ELEMENT', patterns: [ '[centermath]' ] }
];
nlp.learnCustomEntities(customPatterns);

function getMyPOS(text) {
  const myPOS = [];
  const doc = nlp.readDoc(text);
  doc.tokens().each((t) => {
    const parent = t.parentCustomEntity();
    if (!parent) {
      myPOS.push(t.out(its.pos));
    } else {
      myPOS.push(parent.out(its.type));
    }
  });
  return myPOS;
}

let defPOS = [];

function print(str) {
  if (!printExamples) {
    console.log(str);
  }
}

function output(str) {
  if (verbose) {
    console.log(str);
  }
}

/**
 *  Trim the input string using the sentence boundary.
 * @param str The input string.
 * @param index The index to indicate last (-1) sentence is required in case of prefix. Whereas, first (0) sentence is required in case of postfix.
 * @returns The trimmed string.
 */
function trimAtSB(str, index) {
  let sentences = nlp.readDoc(str).sentences();
  return index === -1
    ? sentences.itemAt(sentences.length() - 1).out()
    : sentences.itemAt(0).out();
}

const allRules = {};

/**
 * Loads the file containing rules
 * @param {*} ruleFile The file containing rules
 */
function loadRules(ruleFile = './rules.json') {
  readJSONFile(ruleFile).forEach(rule => allRules[rule.name] = rule);
}

/**
 * 
 * @param {*} reg 
 * @returns 
 */
function getRegExp(reg) {
  return Array.isArray(reg) ?
    new RegExp(...reg) : new RegExp(reg);
}

/**
 * The rule engine
 * @param {*} rules Array containing the order in which various rules have to be executed
 * @param {*} phrase The concordance string
 * @param {*} pattern The POS tagged form of the phrase
 * @returns 
 */
function ruleEngine(rules, phrase, pattern) {
  for (let name of rules) {
    let rule = allRules[name];
    if (!rule) continue;
    let applicable = true;
    for (let [kind, reg] of rule.precondition) {
      let target = kind === 'phrase' ? phrase : pattern;
      if (!target.match(getRegExp(reg))) {
        applicable = false;
        break;
      }
    }
    if (!applicable) continue;
    for (let [kind, reg, repl] of rule.action) {
      // For printing examples getting operated under a specific rule
      if (printExamples && (rule.name === "rule4a")) {
        // console.log(getRegExp(reg));
        if (pattern.match(getRegExp(reg))) {
          console.log(phrase);
        }
      }
      /////////////
      if (kind === 'phrase') {
        phrase = phrase.replace(getRegExp(reg), repl);
      } else {
        pattern = pattern.replace(getRegExp(reg), repl);
      }
    }
  }
  return [phrase, pattern];
}

/**
 * Perform preprocessing operations on the concordance string.
 * @param {*} prefixString The prefix part of the concordance
 * @param {*} postfixString The postfix part of the concordance
 * @returns [phrase, pattern] phrase: The concordance string after preprocessing, pattern: The POS tag form of the preprocessed concordance string.
 */
function preprocessPhrase(prefixString, postfixString) {
  prefixString = trimAtSB(prefixString, -1);
  postfixString = trimAtSB(postfixString, 0);
  let [phrase] = ruleEngine(
    ['preprocess1', 'preprocess3', 'preprocess2'],
    prefixString + " CENTERMATH " + postfixString, '');
  let pattern = getMyPOS(phrase);
  return [phrase, pattern.join(',')];
}

// The default order of rules for rewriting the NLP pattern.
var defaultOrder = ['rule2', 'rule3', 'rule4a', 'rule4b',
                    'rule5a', 'rule5b', 'rule5c', 'rule6a', 'rule6b',
                    'rule21', 'rule7', 'rule8', 'rule9', 'rule10', 'rule11',
                    'rule12', 'rule13',
                    'rule18', 'rule15a', 'rule15b', 'rule15c', 
                    'rule17', 'rule16', 'rule19',
                    'rule4a', 'rule4b',
                    'rule14', 'rule20'];

/**
 * Computes frequencies of the various elements available in the given array.
 * @param {*} array The array
 * @returns Array of {content: "element", frequency: num}
 */
                    function computeFrequency(array) {
  let freqArray = [];
  freqArray.push({ content: array[0], frequency: 1 });
  for (let i = 1, content1; (content1 = array[i]); i++) {
    let continueFlag = true;
    for (let j = 0, arr2; (arr2 = freqArray[j]); j++) {
      let content2 = arr2.content;
      if (content1 === content2) {
        freqArray[j].frequency += 1;
        continueFlag = false;
        break;
      }
    }
    if (continueFlag) {
      freqArray.push({ content: content1, frequency: 1 });
    }
  }
  console.log("No. of elements are " + freqArray.length);
  return freqArray;
}

function readJSONFile(path) {
  let rawdata = fs.readFileSync(path);
  let data = JSON.parse(rawdata);
  // console.log(data);
  return data;
}

/**
 * Reading the annotated files.
 */
function loadData() {
  let data1 = readJSONFile("../../data/data_annotated_set.json");
  let data2 = readJSONFile(
    "../../data/data_annotated_Integer Equivalence Classes and Symmetries.json"
  );
  let data3 = readJSONFile("../../data/data_annotated_induction.json");
  let data4 = readJSONFile("../../data/data_annotated_divisionAlgo.json");

  return data1.concat(data2).concat(data3).concat(data4);
}

// Reading and combining rawData
function loadRawData() {
  let rawData1 = readJSONFile("../../data/rawData_set.json");
  let rawData2 = readJSONFile("../../data/rawData_integers.json");
  let rawData3 = readJSONFile("../../data/rawData_induction.json");
  let rawData4 = readJSONFile("../../data/rawData_divisionAlgo.json");
  
  return rawData1.concat(rawData2).concat(rawData3).concat(rawData4);
}
// console.log("Total Concordances in rawData: "+rawData.length);

function identifyNPs(pattern, reg) {
  for (let i= 0; (pattern.search(reg) != -1); i++) {
    let replaceValue = "NP"+i+",";
    pattern = pattern.replace(reg, replaceValue);
  }
  output(pattern);
  return pattern;
}

function generateNPMap(pattern, reg) {
  let indexMap = generateIndexMap(pattern);
  let NPMap = new Map;
  const matches = [...pattern.matchAll(reg)];
  matches.forEach( (x, i) => {
    let value = x[0];
    value = value.replace(/,$/, "");
    const len = (value.split(",")).length;
    const tokenNumber = indexMap.get(x.index);
    NPMap.set(i, tokenNumber+","+len);
});
return NPMap;
}

function generateIndexMap(pattern) {
  let indexMap = new Map();
  indexMap.set(0, 0);
  let matches = [...pattern.matchAll(/,/g)];
  matches.forEach((x, i) => {
    indexMap.set(x.index + 1, i + 1);
  });
  return indexMap;
}

function getNP(x, NPMap, flag = 0) {
  let index = Math.floor(x.charAt(x.length - 1)) + flag;
  let [tokenIndex, len] = (NPMap.get(index)).split(',');
  tokenIndex = Math.floor(tokenIndex);
  len = Math.floor(len);
  return [tokenIndex, len];
}

function convert2phrase(pattern, originalPattern, phrase, NPMap) {
  let def;
  let firstNPIndex = pattern.findIndex(value => /NP\d/.test(value)); //Index of the first NP occuring in the pattern
  if (firstNPIndex >= 0) {
    let [tokenIndex, len] = getNP(pattern[firstNPIndex], NPMap);
    for (let i = firstNPIndex + 1, x; x = pattern[i]; i++) {
      if (x.search(/NP\d/) != -1) {
        let [tokenIndex1, len1] = getNP(x, NPMap);
        len = tokenIndex1 - tokenIndex + len1;
      }
    }
    // Handling NP,CCONJ,(PART,)?NP
    if (originalPattern[tokenIndex+len] == "CCONJ" && ["ADJ", "NOUN"].includes(originalPattern[tokenIndex + len + 1])) {
      let [tokenIndex1, len1] = getNP(pattern[firstNPIndex], NPMap, 1);
      len = tokenIndex1 - tokenIndex + len1;
    } else if (originalPattern[tokenIndex+len] == "CCONJ" && originalPattern[tokenIndex + len + 1] == "PART" && ["ADJ", "NOUN"].includes(originalPattern[tokenIndex + len + 2])) {
      let [tokenIndex1, len1] = getNP(pattern[firstNPIndex], NPMap, 1);
      len = tokenIndex1 - tokenIndex + len1;
    }
    // handling the cases where definition starts with non-NP
    if (firstNPIndex > 0) {
      tokenIndex -= 1;
      len += 1;
      while(originalPattern[tokenIndex] != pattern[0] && tokenIndex >= 0) {
        tokenIndex -= 1;
        len += 1;
      }
    }
    def = (phrase.slice(tokenIndex, tokenIndex + len)).join(' ');
    if(def !== "MATH") {
      defPOS.push((originalPattern.slice(tokenIndex, tokenIndex + len)).join(','));
    }
  }
  return def === "MATH" ? null : def;
}

function extractDefinitions(phrase, pattern, NPMap) {
  let originalPattern = getMyPOS(phrase);
  phrase = (nlp.readDoc(phrase).tokens()).out();  // Getting phrase tokens
  pattern = pattern.replace(/(^ELEMENT,|,ELEMENT$)/, "");  // Remove ELEMENT if present at the boundary of the final pattern
  pattern = pattern.split(',');
  let centerMathIndex = pattern.indexOf("ELEMENT");
  let defs = [];
  if (centerMathIndex == -1) {
    defs.push(convert2phrase(pattern, originalPattern, phrase, NPMap));
  } else {
    let pattern1 = pattern.slice(0, centerMathIndex);
    let def1 = convert2phrase(pattern1, originalPattern, phrase, NPMap);
    if (def1 !== null) {
      defs.push(def1);
    }
    let pattern2 = pattern.slice(centerMathIndex + 1,);
    let def2 = convert2phrase(pattern2, originalPattern, phrase, NPMap);
    if (def2 !== null) {
      defs.push(def2);
    }
  }
  print(defs.join(', ')+"\n");
}

function runAnalysis() {
  loadRules();
  let data = loadData();
  output("Total Concordances: "+data.length);
  var dataTrue = data.filter((x) => x._isDefinition == true);
  var dataFalse = data.filter((x) => x._isDefinition == false);
  output("Valid definitions"+dataTrue.length);
  output("Not Valid Definition: "+dataFalse.length+"\n");
  let rawData = loadRawData();
  let patterns = [];
  for (let i = 0, x; (x = data[i]); i++) {
    const x1 = rawData[i];
    if (x._isDefinition) {
      let fullPhrase = x1._prefix + " CENTERMATH " + x1._postfix;
      getPOS(fullPhrase);
      print(x._speech);
      // Preprocessing the phrase
      let [phrase, pattern] = preprocessPhrase(x1._prefix, x1._postfix);
      let NPMap = generateNPMap(pattern, /((ADJ|NOUN),?)+/g);
      // console.log(NPMap);
      pattern = identifyNPs(pattern, /((ADJ|NOUN),?)+/);
      // Rewriting the pattern
      [phrase, pattern] = ruleEngine(defaultOrder, phrase, pattern);
      extractDefinitions(phrase, pattern, NPMap);
      output(pattern + "\n");
      patterns.push(pattern);
    }
  }
  // output("\n Patterns Spectrum =");
  // output(computeFrequency(patterns));
}

function runPatternTests(testFile = './testset.json') {
  loadRules();
  let tests = JSON.parse(fs.readFileSync(testFile));
  for (let expr of tests) {
    test.test(
      `Test: ${expr.phrase}`, (t) => {
        assert.strictEqual(
          ruleEngine(defaultOrder, expr.phrase, expr.pattern)[1], expr.expected);
    });
  }
}

function getPOS(phrase) {
  print(phrase);
  output("" + getMyPOS(phrase));
}

module.exports.analysis = runAnalysis;

runAnalysis();
console.log("defPOS Spectrum = ");
console.log(computeFrequency(defPOS));
console.log("Total number of definitions extracted are "+defPOS.length);
// runPatternTests();

/**
   getPOS("Let CENTERMATH and MATH be functions.");
   getPOS("a positive denominator. The function CENTERMATH is onto but not onetoone.");
   getPOS("For any set CENTERMATH , a onetoone and onto mapping");
   getPOS("If CENTERMATH and MATH are both onetoone,");
   fs.writeFileSync('./testset_tmp.json', JSON.stringify(testSet, null, 2));
**/
   