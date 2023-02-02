# Rules

## Preprocessing (On the concordance string (Phrase))

- **Preprocessing 1**: Replace ``one-to-one" with ``onetoone".
**Reasoning**: The POS tags corresponding to ``one-to-one" is coming out to be ``NUM,PUNCT,ADP,PUNCT,NUM". Whereas, for ``onetoone", it is coming to be ``NOUN". 
**Example(s)**: 
    * If CENTERMATH and MATH are both one-to-one
    * a positive denominator. The function CENTERMATH is onto but not one-to-one.
    * For any set CENTERMATH , a one-to-one and onto mapping
    * a one-to-one and onto mapping CENTERMATH is called a permutation of
    * with MATH, then MATH. Consequently, CENTERMATH is one-to-one. Now suppose that
**RegExp**:
```
    "precondition": [],
    "action": [
      ["phrase", ["one-to-one", "gi"], "onetoone"]
    ],
```

- **Preprocessing 2**: Replace adjecent multiple MATH elements with single MATH element. If one of them is CENTERMATH, then it will be replaced by CENTERMATH.
e.g.,
| __Original String__ | __Replaced String__ |
| --- | --- |
| CENTERMATH, MATH AND MATH | CENTERMATH |
| MATH, CENTERMATH, AND MATH | CENTERMATH |
| CENTERMATH OR MATH | CENTERMATH |
| CENTERMATH AND MATH | CENTERMATH |
| MATH, MATH, and MATH | MATH |
**Reasoning**: Let we have concordances, ``Let CENTERMATH, MATH, and MATH are sets", ``Let MATH, CENTERMATH, and MATH are sets", and ``Let MATH, MATH, and CENTERMATH are sets". For processing, all of them can be simplified to ``Let CENTERMATH are sets".
**Example(s)**:
    * Let MATH, MATH, MATH, and CENTERMATH be integers, where MATH and
    * 2 is in the set CENTERMATH , and MATH to say that
    * a subset of MATH, written CENTERMATH or MATH, if every element
    * the definition of the complement, CENTERMATH and MATH. Therefore, MATH and
    * MATH, MATH, and MATH, then CENTERMATH is the set
**RegExp**:
```
    "precondition": [],
    "action": [
      ["phrase", "(MATH\\s*(,|(, )?(and|or))\\s+)*CENTERMATH(\\s*(,|(, )?(and|or))\\s+MATH)*", "CENTERMATH"],
      ["phrase", "(MATH\\s*(,|(, )?and|or)?\\s)+MATH", "MATH"]
    ],
```

- **Preprocessing 3**: remove ``'s".
**Reasoning**: We didn't find ``'s" useful in our analysis.
**Example(s)**: 
    * of the MATH 's and CENTERMATH 's are prime, MATH and
**RegExp**:
```
    "precondition": [],
    "action": [
      ["phrase", ["\\'s", "gi"], ""]
    ],
```

## On the POS tagged form (Pattern) of the concordance

- **Rule 1**: Replace various permutations and combinations of ADJ (Adjective) and NOUN (Noun) with NP (Noun Phrase). This is based on the patterns observed in the spectrum of definitions.
**Example(s)**:
    * ADJ,NOUN
    * NOUN
    * NOUN,NOUN
    * NOUN,ADJ
    * ADJ,ADJ,NOUN
    * ADJ
    * NOUN, ADJ and so on
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", ["((ADJ|NOUN),?)+", "g"], "NP,"]
    ],
```
This is slightly modified to give indexing to each NP, i.e., instead of just ``NP", it will be ``NP0", ``NP1", and ``NP2" and so on. This is done to ease in identification of NPs while extracting definition.

- **Rule 2**: Remove DET (Determiner: a, an, the, etc.).
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", ["(DET),?", "g"], ""]
    ],
```

- **Rule 3**: Merge multiple NPs seperated by CCONJ (Coordinating conjuction such as and, or, but, etc.). For this, replace ``NP,CCONJ,NP" with NP. There is also a possibility that PART (Particle such as ``not") is present before NP, allow such cases as well.
**Example(s)**:
    * define a mapping or function CENTERMATH from a set MATH to
    * a positive denominator. The function CENTERMATH is onto but not one-to-one.
    * a one-to-one and onto mapping CENTERMATH is called a permutation of
    * Define MATH if MATH. Clearly CENTERMATH is reflexive and symmetric. To
    * a one-to-one and onto map CENTERMATH . The three vertices have MATH
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern",["(NP\\d),CCONJ,(PART,)?NP\\d", "g"], "$1"]
    ],
```

- **Rule 4a**: Remove prefix if NP is not present. As we know that our definition will have at least one NP. So, we can remove the side which doesn't contain the NP.
**Example(s)**:
    * (3) Assume that CENTERMATH are both onto functions.
    * However, since CENTERMATH is onto, there is an
    * If CENTERMATH is any set, we will
    * We usually write CENTERMATH for the inverse of MATH.
    * Then CENTERMATH defines a map from MATH
**RegExp**:
```
    "precondition": [
      ["pattern", "^.*(?<!(NP.*))ELEMENT"]
    ],
    "action": [
      ["pattern", "^.*(?<!(NP.*))ELEMENT", "DCARE,ELEMENT"]
    ],
```

- **Rule 4b**: Remove postfix if NP is not present.
**Example(s)**:
    * The function MATH has inverse CENTERMATH by Example 1.12 .
    * logarithm and the exponential functions, CENTERMATH, are inverses of
    * by simply inverting the matrix CENTERMATH ; that is, MATH.
    * the identity map; that is, CENTERMATH .
    * The function MATH has inverse CENTERMATH by Example 1.12 .
**RegExp**:
```
    "precondition": [
      ["pattern", "ELEMENT(?!(.*NP)).*$"]
    ],
    "action": [
      ["pattern", "ELEMENT(?!(.*NP)).*$", "ELEMENT,DCARE"]
    ],
```

- **Rule 5a**: If CENTERMATH followed by ``,/is/are" followed by ``called/said" then the NP present post the specified pattern is a potential definition.
**Example(s)**: 
    * work within one fixed set CENTERMATH , called the universal set .
    * can define a new set CENTERMATH , called the Cartesian product of
    * The set CENTERMATH is called the domain of
    * is MATH, i.e., MATH, then CENTERMATH is said to be onto
    * a onetoone and onto mapping CENTERMATH is called a permutation of
**RegExp**:
```
    "precondition": [
      ["phrase", ["CENTERMATH\\s*(,|is|are)\\W*(called|said)", "i"]]
    ],
    "action": [
      ["pattern", "ELEMENT,(PUNCT|AUX),VERB.*(PART,)?(NP\\d).*$", "ELEMENT,DCARE,$2$3,DCARE"]
    ],
```

- **Rule 5b**: If phrase contains ``to define CENTERMATH," then replace PUNCT (Punctuation) just after ELEMENT in the pattern by the DCARE (Don't Care).
**Example(s)**: 
    * are two ways to define CENTERMATH , the factorial of a positive
**RegExp**:
```
    "precondition": [
      ["phrase", "to define\\s+CENTERMATH\\s*,"]
    ],
    "action": [
      ["pattern", "ELEMENT,PUNCT", "ELEMENT,DCARE"]
    ],
```

- **Rule 5c**: If punctuation is present in the postfix, then ignore everything post punctuation.
**Example(s)**: 
    * an element of the set CENTERMATH , we write MATH.
    * a subset of MATH, written CENTERMATH, if every element
    * For any set CENTERMATH , we define the complement of
    * complement of MATH, denoted by CENTERMATH , to be the set
    * Given sets CENTERMATH , we can define a new
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT(.*?)PUNCT.*", "ELEMENT$1DCARE"]
    ],
```

- **Rule 6a**: If the concordance string contains ``,/;" followed by ``written/denoted by/say/that is,/i.e.," followed by CENTERMATH then ignore everything between punctuation and CENTERMATH (including punctuation).
**Example(s)**: 
    * a subset of MATH, written CENTERMATH, if every element
    * complement of MATH, denoted by CENTERMATH , to be the set
    * the identity map; that is, CENTERMATH .
    * finite number of primes, say CENTERMATH .
**RegExp**:
```
    "precondition": [
      ["pattern", "PUNCT.*ELEMENT"],
      ["phrase", ["[,;]\\s+(written|denoted by|say|that is,|i\\.e\\.,)\\s+CENTERMATH", "i"]]
    ],
    "action": [
      ["pattern", "PUNCT.*ELEMENT", "DCARE,ELEMENT"]
    ],
```

- **Rule 6b**: If punctuation is present just before the CENTERMATH then ignore the punctuation. Whereas, if there are words in between punctuation and the CENTERMATH then ignore everything before the punctuation (including punctuation).
**Example(s)**:
    * For example, if CENTERMATH is the set of even
    * perform certain operations: the union CENTERMATH of two sets MATH and
    * be disjoint ; for example, if CENTERMATH is the set of even
    * the definition of the complement, CENTERMATH.
    * MATH For example, the set CENTERMATH consists of all of 3-tuples
**RegExp**:
```
    "precondition": [
      ["pattern", "PUNCT.*ELEMENT"]
    ],
    "action": [
      ["pattern", "PUNCT,ELEMENT", "DCARE,ELEMENT"],
      ["pattern", [".*PUNCT(.*)ELEMENT", "g"], "DCARE$1ELEMENT"]
    ],
```

- **Rule 7**: If ADV (Adverb)/SCONJ (Subordinating Conjuction)/CCONJ (Coordinating Conjuction) is present in the prefix then remove everything before ADV/SCONJ/CCONJ (inclusive).
**Example(s)**: 
    * For example, if CENTERMATH is the set of even
    * be disjoint ; for example, if CENTERMATH is the set of even
    * set of even integers and CENTERMATH is the set of odd
    * Neither MATH nor MATH, since CENTERMATH is the smallest element in
    * a function MATH such that CENTERMATH is prime for each integer
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", [".*(ADV|SCONJ|CCONJ)(.*)ELEMENT", "g"], "DCARE$2ELEMENT"]
    ],
```

- **Rule 8**: Remove everything post SCONJ (Subordinating Conjuction)/CCONJ (Coordinating Conjuction) in the postfix.
**Example(s)**: 
    * proper subset of a set CENTERMATH if MATH but MATH.
    * perform certain operations: the union CENTERMATH of two sets MATH and
    * Let CENTERMATH be the universal set and
    * Conversely, let CENTERMATH be bijective and let MATH.
    * equivalence relation on a set CENTERMATH and let MATH.
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", ["ELEMENT(.*)(SCONJ|CCONJ).*", "g"], "ELEMENT$1DCARE"]
    ],
```

- **Rule 9**: NUM (Numeral) in the prefix has no importance, hence, remove it.
**Example(s)**: 
    * 2 is in the set CENTERMATH to say that
    * union MATH of two sets CENTERMATH is defined as
    * of two sets CENTERMATH is defined as
    * Two sets CENTERMATH are disjoint exactly
    * work within one fixed set CENTERMATH , called the universal set .
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "(.*)NUM,(.*)ELEMENT", "$1$2ELEMENT"]
    ],
```

- **Rule 10**: if ``such as/by" just before the CENTERMATH then replace ``such as/by" by DCARE (Don't Care) in the pattern form of the phrase.
**Example(s)**: 
    * Define this map by CENTERMATH for all MATH.
    * for small numbers such as CENTERMATH, but
    * small numbers such as CENTERMATH, but it
    * numbers such as CENTERMATH, but it is
**RegExp**:
```
    "precondition":[
      ["phrase", "(such as|by)\\s+CENTERMATH"]
    ],
    "action": [
      ["pattern", "(NP\\d),(PRON,)?ADP,ELEMENT", "$1,DCARE,ELEMENT"]
    ],
```

- **Rule 11**: If ``ADP (Adposition),NP" is present just before the CENTERMATH then ignore everything before NP in the prefix. Whereas, If ``NP,ADP,NP,DCARE" is present just before the CENTERMATH then ignore everything before the ``NP,ADP,NP".
**Example(s)**: 
    * of writing down ordered pairs CENTERMATH , we write MATH.
    * MATH is invertible with inverse CENTERMATH .
    * a collection of nonempty sets CENTERMATH such that MATH for MATH
    * on MATH with equivalence classes CENTERMATH .
    * 1.21 , two pairs of integers, CENTERMATH, are in the
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", ".*ADP,(NP\\d),ELEMENT", "DCARE,$1,ELEMENT"],
      ["pattern", ".*(NP\\d),ADP,(NP\\d),DCARE,ELEMENT", "DCARE,$1,ADP,$2,DCARE,ELEMENT"]
    ],
```

- **Rule 12**: Remove everything in the prefix which comes before VERB (Verb)/PRON (Pronoun)/AUX (Auxiliary).
**Example(s)**: 
    * Since MATH, there exist integers CENTERMATH such that MATH.
    * there exist integers CENTERMATH such that MATH.
    * exists an additional prime number CENTERMATH that divides MATH.
    * MATH since in this case CENTERMATH is prime.
    * is to find a function CENTERMATH such that MATH is prime
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", [".*(VERB|PRON|AUX)(.*)ELEMENT", "g"], "DCARE$2ELEMENT"]
    ],
```

- **Rule 13**: If ``for" is present just after the CENTERMATH then ignore everything except ``NP/NP,ADP,NP" in the postfix.
**Example(s)**: 
    * Define this map by CENTERMATH for all MATH.
    * We usually write CENTERMATH for the inverse of MATH.
    * We claim that congruence modulo CENTERMATH forms an equivalence relation of
    * The sets CENTERMATH form a partition
    * there exists a multiplicative inverse CENTERMATH for MATH; that is, a
**RegExp**:
```
    "precondition": [
      ["phrase", "CENTERMATH\\s+for"]
    ],
    "action": [
      ["pattern", "ELEMENT.*?(NP\\d,ADP,)?(NP\\d).*$", "ELEMENT,DCARE,$1$2"]
    ],
```

<!--
- **Rule 14r**: If ``NP,ADP,NP" is present just after the CENTERMATH then ignore everything except first NP.
**Example(s)**: 
    * No example
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT,(NP\\d),ADP,NP", "ELEMENT,$1"]
    ],
```
-->

- **Rule 14**: If prefix contains NP, then remove everything before that. Similarly, If NP is present in the postfix, then remove everything post that.
**Example(s)**: 
    * an element of the set CENTERMATH , we write MATH.
    * For example, if CENTERMATH is the set of even
    * A set CENTERMATH is a subset of MATH,
    * proper subset of a set CENTERMATH if MATH but MATH.
    * union MATH of two sets CENTERMATH is defined as
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", ".*?(NP\\d)(.*)ELEMENT", "$1$2ELEMENT"],
      ["pattern", "ELEMENT(.*)(NP\\d).*", "ELEMENT$1$2"]
    ],
```

- **Rule 15a**: If AUX (Auxiliary) followed by ``NP/NP,ADP,NP" is present just after the CENTERMATH then ignore everything except ``NP/NP,ADP,NP". If NUM is present between AUX and NP, then ignore that as well.
**Example(s)**: 
    * that two integers CENTERMATH are equivalent mod MATH if
    * Let CENTERMATH be the set of equivalence
    * Letting CENTERMATH be the equivalence class of
    * basis, an impossible task if CENTERMATH is an infinite set, we
    * Let CENTERMATH be a statement about integers
    * Every integer CENTERMATH is divisible by MATH for
    * where CENTERMATH are real numbers, MATH, and
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT,AUX,(NUM,)?(NP\\d,ADP,)?(NP\\d).*$", "ELEMENT,DCARE,$2$3"]
    ],
```

- **Rule 15b**: If CENTERMATH followed by ``defines/form/to denote/that is" then ignore everything except ``NP/NP,ADP,NP/PART,NP" in the postfix.
**Example(s)**: 
    * we will use CENTERMATH to denote the identity mapping
    * Then CENTERMATH defines a map from MATH
    * We claim that congruence modulo CENTERMATH forms an equivalence relation of
    * The sets CENTERMATH form a partition of the
    * An integer CENTERMATH that is not prime is
**RegExp**:
```
    "precondition": [
      ["phrase", "CENTERMATH\\s+(defines|form|to denote|that is).*$"]
    ],
    "action": [
      ["pattern", "ELEMENT.*?(PART,|NP\\d,ADP,)?(NP\\d).*$", "ELEMENT,DCARE,$1$2"]
    ],
```

- **Rule 15c**: If ADP is present in the postfix and DCARE is not present just after the ELEMENT (corresponding to CENTERMATH) then ignore the entire postfix.
**Example(s)**: 
    * perform certain operations: the union CENTERMATH of two sets MATH and
    * MATH For example, the set CENTERMATH consists of all of 3-tuples
    * define a mapping or function CENTERMATH from a set MATH to
    * function MATH from a set CENTERMATH to a set MATH to
    * Figure 1.7 we define relations CENTERMATH from MATH to
    *we define relations CENTERMATH from MATH to MATH.
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT,(?!DCARE).*ADP.*$", "ELEMENT,DCARE"]
    ],
```

- **Rule 16**: If ADV is present in the postfix then ignore the entire postfix.
**Example(s)**: 
    * Two sets CENTERMATH are disjoint exactly when MATH.
    * The integers modulo CENTERMATH are a very important example
    * We say that two integers CENTERMATH are relatively prime
    * that two integers CENTERMATH are relatively prime if MATH.
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT.*ADV.*$", "ELEMENT,DCARE"]
    ],
```

- **Rule 17**: If PART (Particle) is present in the postfix and NP is not present just after the PART then ignore the entire postfix.
**Example(s)**: 
    * set MATH to a set CENTERMATH to be the special type
    * and MATH, define addition modulo CENTERMATH to be MATH; that is,
    * Notice that the set CENTERMATH is not well-ordered since it
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT.*PART,(?!NP).*$", "ELEMENT,DCARE"]
    ],
```

- **Rule 18**: If ``has/have/such that" is present just after the CENTERMATH then ignore the entire postfix.
**Example(s)**:
    * of relation where each element CENTERMATH has a unique element MATH
    * The function CENTERMATH has inverse MATH by Example
    * set MATH is a relation CENTERMATH such that
    * there exists an invertible matrix CENTERMATH such that MATH. For example,
    * a collection of nonempty sets CENTERMATH such that MATH for MATH
**RegExp**:
```
    "precondition": [
      ["phrase", "CENTERMATH\\s+(has|have|such that)"]
    ],
    "action": [
      ["pattern", "ELEMENT.*$", "ELEMENT"]
    ],
```

- **Rule 19**: If Pronoun is present just after the ELEMENT then ignore the entire postfix.
**Example(s)**: 
    * For example, the function CENTERMATH that sends each real number
    * For every integer CENTERMATH there is an additive inverse
    * every motion of the triangle CENTERMATH there is another motion MATH
    * exists an additional prime number CENTERMATH that divides MATH.
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", "ELEMENT,PRON.*$", "ELEMENT,DCARE"]
    ],
```

- **Rule 20**: Remove DCARE from the pattern. Also, remove comma (,) from the start/end of the pattern, if present.
**RegExp**:
```
    "precondition": [],
    "action": [
      ["pattern", ["DCARE,?", "g"], ""],
      ["pattern", ["(^,|,$)", "g"], ""]
    ],
```

- **Rule 21**: If ``then" is not present in the prefix of the concordance, then Ignore postfix if the following pattern ``(ADP|ADV),NP,ELEMENT,AUX" is present.
**Example(s)**:
    * equivalence relation on a set CENTERMATH is a relation MATH such
    * partition MATH of a set CENTERMATH is a collection of nonempty
    * a permutation of a set CENTERMATH is a one-to-one and onto
    * greatest common divisor of integers CENTERMATH and MATH is a positive
    * divisor of integers MATH and CENTERMATH is a positive integer MATH
**RegExp**:
```
    "precondition": [
      ["phrase", ["^(?!.*then).*CENTERMATH", "i"]]
    ],
    "action": [
      ["pattern", "(ADP|ADV),(NP\\d),ELEMENT,AUX.*$", "$1,$2,ELEMENT"]
    ],
```
