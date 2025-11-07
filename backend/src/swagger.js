export const openApiSpec = {
  openapi: '3.0.1',
  info: {
    title: 'SILab Virtual Lab API',
    version: '1.0.0',
    description:
      'Dokumentasi endpoint utama Virtual Lab Information System (SILab). Seluruh endpoint berada di bawah prefix `/api`.'
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local development' },
    { url: '/api', description: 'Relative to current host (production)' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['admin', 'assistant', 'student'] }
        }
      },
      Assignment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          focus: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Submission: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          assignmentId: { type: 'string' },
          studentId: { type: 'string' },
          studentName: { type: 'string' },
          link: { type: 'string' },
          notes: { type: 'string' },
          submittedAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          grade: {
            type: 'object',
            nullable: true,
            properties: {
              score: { type: 'integer' },
              feedback: { type: 'string' },
              graderId: { type: 'string' },
              graderName: { type: 'string' },
              gradedAt: { type: 'string', format: 'date-time' }
            }
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                originalName: { type: 'string' },
                contentType: { type: 'string' },
                sizeBytes: { type: 'integer' },
                uploadedBy: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Cek status API',
        responses: {
          200: {
            description: 'Service berjalan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login dengan username & password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login sukses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Kredensial tidak valid' }
        }
      }
    },
    '/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Login dengan Google ID token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login Google sukses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { description: 'Token Google tidak valid' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        summary: 'Mendapatkan profil user saat ini',
        responses: {
          200: {
            description: 'Profil user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/assignments': {
      get: {
        tags: ['Assignments'],
        security: [{ bearerAuth: [] }],
        summary: 'Daftar tugas',
        responses: {
          200: {
            description: 'List assignments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    assignments: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Assignment' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Assignments'],
        security: [{ bearerAuth: [] }],
        summary: 'Buat tugas baru (assistant/admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  focus: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Tugas berhasil dibuat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    assignment: { $ref: '#/components/schemas/Assignment' }
                  }
                }
              }
            }
          },
          400: { description: 'Validasi gagal' }
        }
      }
    },
    '/assignments/{assignmentId}': {
      put: {
        tags: ['Assignments'],
        security: [{ bearerAuth: [] }],
        summary: 'Edit tugas',
        parameters: [
          { name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  focus: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Tugas diperbarui',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    assignment: { $ref: '#/components/schemas/Assignment' }
                  }
                }
              }
            }
          },
          404: { description: 'Tugas tidak ditemukan' }
        }
      },
      delete: {
        tags: ['Assignments'],
        security: [{ bearerAuth: [] }],
        summary: 'Hapus tugas tertentu',
        parameters: [
          { name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Tugas dihapus' },
          404: { description: 'Tugas tidak ditemukan' }
        }
      }
    },
    '/assignments/{assignmentId}/submissions': {
      get: {
        tags: ['Submissions'],
        security: [{ bearerAuth: [] }],
        summary: 'Daftar submission untuk suatu tugas',
        parameters: [
          { name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    assignment: { $ref: '#/components/schemas/Assignment' },
                    submissions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Submission' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Submissions'],
        security: [{ bearerAuth: [] }],
        summary: 'Mahasiswa mengumpulkan tugas',
        parameters: [
          { name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  link: { type: 'string' },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Pengumpulan dibuat' },
          200: { description: 'Pengumpulan diperbarui' }
        }
      }
    },
    '/submissions/mine': {
      get: {
        tags: ['Submissions'],
        security: [{ bearerAuth: [] }],
        summary: 'Daftar pengumpulan milik mahasiswa saat ini',
        responses: {
          200: {
            description: 'Berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    submissions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Submission' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/submissions/{submissionId}/grade': {
      post: {
        tags: ['Submissions'],
        security: [{ bearerAuth: [] }],
        summary: 'Asisten menilai submission',
        parameters: [
          { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['score'],
                properties: {
                  score: { type: 'integer', minimum: 0, maximum: 100 },
                  feedback: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Nilai tersimpan' },
          404: { description: 'Submission tidak ditemukan' }
        }
      },
      delete: {
        tags: ['Submissions'],
        security: [{ bearerAuth: [] }],
        summary: 'Hapus nilai submission',
        parameters: [
          { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Nilai dihapus' }
        }
      }
    },
    '/submissions/{submissionId}/files': {
      get: {
        tags: ['Files'],
        security: [{ bearerAuth: [] }],
        summary: 'Daftar file lampiran',
        parameters: [{ name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Berhasil' }
        }
      },
      post: {
        tags: ['Files'],
        security: [{ bearerAuth: [] }],
        summary: 'Konfirmasi bahwa file berhasil diupload ke storage',
        parameters: [{ name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fileId', 'storagePath', 'fileName'],
                properties: {
                  fileId: { type: 'string' },
                  storagePath: { type: 'string' },
                  fileName: { type: 'string' },
                  contentType: { type: 'string' },
                  fileSize: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'File tercatat' } }
      }
    },
    '/submissions/{submissionId}/files/upload-url': {
      post: {
        tags: ['Files'],
        security: [{ bearerAuth: [] }],
        summary: 'Minta signed URL untuk upload file submission',
        parameters: [{ name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fileName'],
                properties: {
                  fileName: { type: 'string' },
                  fileSize: { type: 'integer' },
                  contentType: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Signed URL diberikan'
          }
        }
      }
    },
    '/submissions/{submissionId}/files/{fileId}/download': {
      get: {
        tags: ['Files'],
        security: [{ bearerAuth: [] }],
        summary: 'Minta signed URL untuk download file lampiran',
        parameters: [
          { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'fileId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'URL download diberikan',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
