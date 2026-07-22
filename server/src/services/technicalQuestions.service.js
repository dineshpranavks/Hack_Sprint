/**
 * Curated Technical Questions Service
 * Covers OOP, DBMS, Operating Systems, and Computer Networks
 */

const TECHNICAL_QUESTION_DATASET = [
  // OBJECT ORIENTED PROGRAMMING (OOP)
  {
    id: 'what-is-polymorphism',
    title: 'What is Polymorphism? Explain Compile-Time vs Runtime Polymorphism',
    subject: 'Object Oriented Programming',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Object Oriented Programming', 'OOP', 'Polymorphism'],
    reasonRecommended: 'Core OOP concept tested in almost every technical interview.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '25 mins',
    summary: 'Polymorphism allows objects to take many forms. Compile-time polymorphism is achieved via method overloading, while runtime polymorphism uses method overriding and virtual functions.'
  },
  {
    id: 'abstraction-vs-encapsulation',
    title: 'Difference Between Abstraction and Encapsulation with Examples',
    subject: 'Object Oriented Programming',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Object Oriented Programming', 'OOP', 'Encapsulation'],
    reasonRecommended: 'Fundamental architectural distinction required for OOP design rounds.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '20 mins',
    summary: 'Abstraction hides internal implementation details to show only functionality, whereas Encapsulation wraps data and code together into a single unit to restrict direct access.'
  },
  {
    id: 'solid-principles-explained',
    title: 'Explain SOLID Principles with Real-World System Examples',
    subject: 'Object Oriented Programming',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Object Oriented Programming', 'SOLID', 'Design Patterns'],
    reasonRecommended: 'Crucial for mid/senior level software engineering interviews.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '45 mins',
    summary: 'SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) guide scalable class design.'
  },
  {
    id: 'virtual-functions-cplusplus',
    title: 'How Virtual Functions and VTABLE Work under the Hood in C++',
    subject: 'Object Oriented Programming',
    difficulty: 'Hard',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Object Oriented Programming', 'Virtual Functions', 'VTABLE'],
    reasonRecommended: 'High-frequency low-level OOP question for Backend & Systems roles.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '40 mins',
    summary: 'Virtual functions enable dynamic dispatch via a virtual table (vtable) and virtual pointer (vptr) maintained by compilers.'
  },
  {
    id: 'diamond-problem-multiple-inheritance',
    title: 'What is the Diamond Problem in Multiple Inheritance and How to Resolve It?',
    subject: 'Object Oriented Programming',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Object Oriented Programming', 'Inheritance'],
    reasonRecommended: 'Tests understanding of class hierarchy resolution and interface design.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '30 mins',
    summary: 'Occurs when a class inherits from two classes that share a common ancestor. Resolved using virtual inheritance in C++ or Interfaces in Java.'
  },

  // DATABASE MANAGEMENT SYSTEMS (DBMS)
  {
    id: 'dbms-normalization-forms',
    title: 'Database Normalization: 1NF, 2NF, 3NF, and BCNF Explained',
    subject: 'Database Management Systems',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Database Management Systems', 'DBMS', 'SQL'],
    reasonRecommended: 'Essential database design theory asked in all backend rounds.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '35 mins',
    summary: 'Normalization reduces data redundancy and prevents insertion, update, and deletion anomalies.'
  },
  {
    id: 'acid-properties-transactions',
    title: 'Explain ACID Properties in DBMS with Real-World Transaction Examples',
    subject: 'Database Management Systems',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Database Management Systems', 'ACID', 'Transactions'],
    reasonRecommended: 'Core database transaction reliability principles.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '25 mins',
    summary: 'Atomicity, Consistency, Isolation, and Durability guarantee reliable relational database transaction processing.'
  },
  {
    id: 'dbms-b-tree-indexing',
    title: 'How B-Tree & B+ Tree Database Indexing Works to Optimize Queries',
    subject: 'Database Management Systems',
    difficulty: 'Hard',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Database Management Systems', 'Indexing', 'B-Trees'],
    reasonRecommended: 'Crucial for database performance tuning & query optimization rounds.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '45 mins',
    summary: 'Indexes accelerate lookup queries from O(N) disk scans to O(log N) tree traversals using B+ Trees.'
  },
  {
    id: 'transaction-isolation-levels',
    title: 'Transaction Isolation Levels and Concurrency Anomalies (Dirty Reads, Phantom Reads)',
    subject: 'Database Management Systems',
    difficulty: 'Hard',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Database Management Systems', 'Concurrency', 'Transactions'],
    reasonRecommended: 'Tested in distributed systems and high-throughput backend interviews.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '50 mins',
    summary: 'Read Uncommitted, Read Committed, Repeatable Read, and Serializable balance performance against concurrency anomalies.'
  },
  {
    id: 'sql-joins-inner-left-right-outer',
    title: 'Explain SQL Joins: Inner, Left, Right, and Full Outer Joins with Examples',
    subject: 'Database Management Systems',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Database Management Systems', 'SQL', 'Joins'],
    reasonRecommended: 'Standard SQL query writing question for engineering candidates.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '20 mins',
    summary: 'Joins combine rows from two or more tables based on a related column between them.'
  },

  // OPERATING SYSTEMS (OS)
  {
    id: 'process-vs-thread',
    title: 'Process vs Thread: Memory Management, Context Switching, and Overhead',
    subject: 'Operating Systems',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Operating Systems', 'OS', 'Concurrency'],
    reasonRecommended: 'Most popular operating systems question in technical interviews.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '25 mins',
    summary: 'A process is an executing instance of a program with isolated memory space; threads share process memory space.'
  },
  {
    id: 'deadlock-conditions-avoidance',
    title: 'What is a Deadlock? 4 Necessary Conditions and Banker\'s Algorithm',
    subject: 'Operating Systems',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Operating Systems', 'Deadlock', 'Concurrency'],
    reasonRecommended: 'Standard OS concurrency management question.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '35 mins',
    summary: 'Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait cause deadlocks. Prevented via Banker\'s Algorithm.'
  },
  {
    id: 'mutex-vs-semaphore',
    title: 'Difference Between Mutex and Semaphore (Counting vs Binary Semaphore)',
    subject: 'Operating Systems',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Operating Systems', 'Synchronization', 'Mutex'],
    reasonRecommended: 'Tests multi-threading synchronization mechanics.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '30 mins',
    summary: 'A Mutex is a locking mechanism for single-thread ownership; a Semaphore is a signaling mechanism managing resource pools.'
  },
  {
    id: 'virtual-memory-paging-segmentation',
    title: 'Virtual Memory, Paging, Page Faults, and Segmentation Explained',
    subject: 'Operating Systems',
    difficulty: 'Hard',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Operating Systems', 'Memory Management', 'Paging'],
    reasonRecommended: 'Evaluates physical vs virtual memory address translation.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '45 mins',
    summary: 'Virtual memory creates an illusion of large contiguous memory using Page Tables and TLB (Translation Lookaside Buffer).'
  },

  // COMPUTER NETWORKS
  {
    id: 'osi-model-7-layers',
    title: 'Explain the 7 Layers of OSI Model and Their Protocol Functions',
    subject: 'Computer Networks',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Computer Networks', 'OSI Model', 'Networking'],
    reasonRecommended: 'Foundational networking model asked in initial technical screenings.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '25 mins',
    summary: 'Physical, Data Link, Network, Transport, Session, Presentation, Application layers govern data transfer across networks.'
  },
  {
    id: 'tcp-vs-udp-protocol-comparison',
    title: 'TCP vs UDP: 3-Way Handshake, Reliability, Header Size, and Use Cases',
    subject: 'Computer Networks',
    difficulty: 'Easy',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Computer Networks', 'TCP', 'UDP'],
    reasonRecommended: 'Core transport layer comparison question.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '25 mins',
    summary: 'TCP is connection-oriented with guaranteed delivery via 3-way handshake (SYN, SYN-ACK, ACK); UDP is connectionless and lightweight.'
  },
  {
    id: 'http-vs-https-tls-handshake',
    title: 'HTTP vs HTTPS: SSL/TLS Handshake, Encryption, and Certificates',
    subject: 'Computer Networks',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Computer Networks', 'HTTP', 'Security'],
    reasonRecommended: 'Critical web network security question for backend & full-stack roles.',
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '35 mins',
    summary: 'HTTPS encrypts HTTP traffic using TLS asymmetric & symmetric key encryption.'
  },
  {
    id: 'dns-resolution-process',
    title: 'What Happens Step-by-Step When You Type a URL in Browser (DNS Resolution)?',
    subject: 'Computer Networks',
    difficulty: 'Medium',
    source: 'technical',
    isCodingProblem: true,
    topics: ['Computer Networks', 'DNS', 'Web Architecture'],
    reasonRecommended: 'Classic end-to-end web request lifecycle question.',
    estimatedInterviewFrequency: 'Very High',
    estimatedStudyTime: '35 mins',
    summary: 'DNS translates domain names to IP addresses via Root, TLD, and Authoritative DNS servers.'
  },
];

/**
 * Filter technical questions by query criteria or subjects.
 */
export const searchTechnicalQuestions = async (queries = [], profile = {}) => {
  const userText = `${profile.company || ''} ${profile.role || ''} ${queries.map(q => typeof q === 'string' ? q : q.query).join(' ')}`.toLowerCase();

  return TECHNICAL_QUESTION_DATASET.map(q => {
    const isSubjectMatch = userText.includes(q.subject.toLowerCase()) || userText.includes((q.topics || []).join(' ').toLowerCase());
    return {
      ...q,
      company: profile.company || 'Tech Company',
      role: profile.role || 'Software Engineer',
      reasonRecommended: isSubjectMatch
        ? `High frequency ${q.subject} topic tested in ${profile.company || 'Tech'} technical interviews.`
        : q.reasonRecommended,
    };
  });
};

export default searchTechnicalQuestions;
