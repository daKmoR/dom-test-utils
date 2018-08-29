import { html } from 'lit-html/lib/lit-extended';
import { getDOMDiff, assertDOMEquals } from '../dom-test-utils.js';
import { template } from './template.js';

suite('getDOMDiff()', () => {
  suite('diffs', () => {
    suite('element', () => {
      test('changed element', () => {
        const diff = getDOMDiff('<div></div>', '<span></span>');

        expect(diff.message).to.equal('tag <div> was changed to tag <span>');
        expect(diff.path).to.equal('div');
      });

      test('added element', () => {
        const diff = getDOMDiff('<div></div>', '<div></div><div></div>');

        expect(diff.message).to.equal('tag <div> has been added');
        expect(diff.path).to.equal('');
      });

      test('removed element', () => {
        const diff = getDOMDiff('<div></div><div></div>', '<div></div>');

        expect(diff.message).to.equal('tag <div> has been removed');
        expect(diff.path).to.equal('');
      });
    });

    suite('attributes', () => {
      test('changed attribute', () => {
        const diff = getDOMDiff('<div foo="bar"></div>', '<div foo="baz"></div>');

        expect(diff.message).to.equal('attribute [foo="bar"] was changed to attribute [foo="baz"]');
        expect(diff.path).to.equal('div');
      });

      test('added attribute', () => {
        const diff = getDOMDiff('<div></div>', '<div foo="bar"></div>');

        expect(diff.message).to.equal('attribute [foo="bar"] has been added');
        expect(diff.path).to.equal('div');
      });

      test('removed attribute', () => {
        const diff = getDOMDiff('<div foo="bar"></div>', '<div></div>');

        expect(diff.message).to.equal('attribute [foo="bar"] has been removed');
        expect(diff.path).to.equal('div');
      });
    });

    suite('text', () => {
      test('changed text', () => {
        const diff = getDOMDiff('<div>foo</div>', '<div>bar</div>');

        expect(diff.message).to.equal('text "foo" was changed to text "bar"');
        expect(diff.path).to.equal('div');
      });

      test('removed text', () => {
        const diff = getDOMDiff('<div>foo</div>', '<div></div>');

        expect(diff.message).to.equal('text "foo" has been removed');
        expect(diff.path).to.equal('div');
      });

      test('added text', () => {
        const diff = getDOMDiff('<div></div>', '<div>foo</div>');

        expect(diff.message).to.equal('text "foo" has been added');
        expect(diff.path).to.equal('div');
      });
    });

    suite('multiple diffs', () => {
      test('returns the first diff', () => {
        const diff = getDOMDiff('<div>foo</div><div foo="bar"></div>', '<div>bar</div><span foo="baz"></span>');

        expect(diff.message).to.equal('tag <div> was changed to tag <span>');
        expect(diff.path).to.equal('div');
      });
    });

    suite('deep changes', () => {
      test('element changes', () => {
        const a = `
          <div>
            <div id="foo">
              <div>
                <div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        `;
        const b = `
          <div>
            <div id="foo">
              <div>
                <div>
                  <span>
                  </span>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        `;
        const diff = getDOMDiff(a, b);

        expect(diff.message).to.equal('tag <div> was changed to tag <span>');
        expect(diff.path).to.equal('div > div#foo > div > div > div');
      });

      test('attribute changes', () => {
        const a = `
          <div>
            <div id="foo">
              <div>
                <div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        `;
        const b = `
          <div>
            <div id="foo">
              <div>
                <div foo="bar">
                  <div>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
          </div>
        `;
        const diff = getDOMDiff(a, b);

        expect(diff.message).to.equal('attribute [foo="bar"] has been added');
        expect(diff.path).to.equal('div > div#foo > div > div');
      });
    });
  });

  suite('equality', () => {
    suite('simple', () => {
      test('element', () => {
        const diff = getDOMDiff('<div></div>', '<div></div>');

        expect(diff).to.equal(undefined);
      });

      test('attribute', () => {
        const diff = getDOMDiff('<div foo="bar"></div>', '<div foo="bar"></div>');

        expect(diff).to.equal(undefined);
      });

      test('text', () => {
        const diff = getDOMDiff('<div>foo</div>', '<div>foo</div>');

        expect(diff).to.equal(undefined);
      });
    });

    suite('complex', () => {
      test('large template', () => {
        const diff = getDOMDiff(template, template);

        expect(diff).to.equal(undefined);
      });

      test('self closing tags', () => {
        const diff = getDOMDiff('<div><br><hr /></div>', '<div><br /><hr></div>');

        expect(diff).to.equal(undefined);
      });
    });

    suite('ordering', () => {
      test('attributes order', () => {
        const diff = getDOMDiff('<div a="1" b="2" c="3"></div>', '<div c="3" a="1" b="2"></div>');

        expect(diff).to.equal(undefined);
      });

      test('class order', () => {
        const diff = getDOMDiff('<div class="foo bar"></div>', '<div class="bar foo"></div>');

        expect(diff).to.equal(undefined);
      });
    });

    suite('whitespace', () => {
      test('trailing whitespace in attributes', () => {
        const diff = getDOMDiff('<div foo="bar" ></div>', '<div foo="bar"></div>');

        expect(diff).to.equal(undefined);
      });

      test('trailing whitespace in class', () => {
        const diff = getDOMDiff('<div class="foo bar "></div>', '<div class="foo bar "></div>');

        expect(diff).to.equal(undefined);
      });

      test('whitespace between classes', () => {
        const diff = getDOMDiff('<div class="foo  bar "></div>', '<div class="foo bar"></div>');

        expect(diff).to.equal(undefined);
      });

      test('whitespace before and after template', () => {
        const diff = getDOMDiff(' <div></div> ', '<div></div>');

        expect(diff).to.equal(undefined);
      });

      test('whitespace in between nodes', () => {
        const diff = getDOMDiff('<div> <div></div>     </div>', '<div><div></div></div>');

        expect(diff).to.equal(undefined);
      });

      test('whitespace around text nodes', () => {
        const diff = getDOMDiff('<div>foo</div>', '<div> foo </div>');

        expect(diff).to.equal(undefined);
      });
    });

    suite('tabs', () => {
      test('tabs before and after template', () => {
        const diff = getDOMDiff('\t\t<div></div>\t', '<div></div>');

        expect(diff).to.equal(undefined);
      });

      test('tabs in between nodes', () => {
        const diff = getDOMDiff('<div>\t<div></div>\t \t \t</div>', '<div><div></div></div>');

        expect(diff).to.equal(undefined);
      });

      test('tabs around text nodes', () => {
        const diff = getDOMDiff('<div>foo</div>', '<div>\tfoo\t</div>');

        expect(diff).to.equal(undefined);
      });
    });

    suite('newlines', () => {
      test('newlines before and after template', () => {
        const diff = getDOMDiff('\n\n<div></div>\n', '<div></div>');

        expect(diff).to.equal(undefined);
      });

      test('newlines in between nodes', () => {
        const diff = getDOMDiff('<div>\n<div></div>\n \n \n</div>', '<div><div></div></div>');

        expect(diff).to.equal(undefined);
      });

      test('newlines around text nodes', () => {
        const diff = getDOMDiff('<div>foo</div>', '<div>\n\n\nfoo\n</div>');

        expect(diff).to.equal(undefined);
      });
    });

    suite('filtered nodes', () => {
      test('comments', () => {
        const diff = getDOMDiff('<div>foo<!-- comment --></div>', '<div>foo</div>');

        expect(diff).to.equal(undefined);
      });

      test('styles', () => {
        const diff = getDOMDiff('<div>foo<style> .foo { color: blue; } </style></div>', '<div>foo</div>');

        expect(diff).to.equal(undefined);
      });

      test('script', () => {
        const diff = getDOMDiff('<div>foo<script>console.log("foo");</script></div>', '<div>foo</div>');

        expect(diff).to.equal(undefined);
      });

      test('ignored tags', () => {
        const diff = getDOMDiff('<div><span>foo</span></div>', '<div><span>bar</span></div>', { ignoredTags: ['span'] });

        expect(diff).to.equal(undefined);
      });
    });


    suite('template string', () => {
      test('differently formatted', () => {
        const a = `
          <div>foo</div>
          <div>bar</div>
          <div></div>
        `;
        const b = `
        <div>foo</div>
<div>


bar
</div>
    <div></div>
      `;
        const diff = getDOMDiff(a, b);

        expect(diff).to.equal(undefined);
      });
    });
  });

  suite('values', () => {
    test('handles strings', () => {
      const diff = getDOMDiff('<div></div>', '<span></span>');

      expect(diff.message).to.equal('tag <div> was changed to tag <span>');
    });

    test('handles TemplateResult', () => {
      const diff = getDOMDiff('<div></div>', html`<span></span>`);

      expect(diff.message).to.equal('tag <div> was changed to tag <span>');
    });

    test('handles TemplateResult with values', () => {
      const diff = getDOMDiff('<div foo="bar"></div>', html`<div foo$="${'baz'}"></div>`);

      expect(diff.message).to.equal('attribute [foo="bar"] was changed to attribute [foo="baz"]');
    });

    test('handles dom nodes', () => {
      const span = document.createElement('span');
      const diff = getDOMDiff('<div></div>', span);

      expect(diff.message).to.equal('tag <div> was changed to tag <span>');
    });

    test('handles arrays', () => {
      const els = [document.createElement('div'), document.createElement('div')]
      const diff = getDOMDiff('<div></div>', els);

      expect(diff.message).to.equal('tag <div> has been added');
    });
  });
});

suite('assertDOMEquals()', () => {
  test('throws an error on diff', () => {
    try {
      assertDOMEquals('<div></div>', '<span></span>');
      throw new Error('Should throw an error');
    } catch (error) {
      assert.equal(error.message, 'tag <div> was changed to tag <span>, at path: div');
    }
  });

  test('prints a deep path', () => {
    try {
      assertDOMEquals('<div><span id="foo"><h1><h2 id="bar">foo<h2></h1></span></div>', '<div><span id="foo"><h1><h2 id="bar">bar<h2></h1></span></div>');
      throw new Error('Should throw an error');
    } catch (error) {
      assert.equal(error.message, 'text "foo" was changed to text "bar", at path: div > span#foo > h2#bar');
    }
  });

  test('does not throw when there is no diff', () => {
    assertDOMEquals('<div></div>', '<div></div>');
  });
});